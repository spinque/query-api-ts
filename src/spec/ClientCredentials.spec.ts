import { ClientCredentials } from '../authentication/ClientCredentials';
import { TokenCache } from '../authentication/TokenCache';

const jsonResponse = (status: number, body: unknown): Response =>
  ({ status, json: async () => body } as unknown as Response);

const noopCache: TokenCache = { get: () => null, set: () => {} };

describe('ClientCredentials', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('posts the client credentials to the token endpoint and returns the token', async () => {
    const fetchMock = jest.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse(200, { access_token: 'tok', expires_in: 3600 }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const cc = new ClientCredentials('my-id', 'my-secret', noopCache);
    await expect(cc.fetchAccessToken()).resolves.toEqual({ accessToken: 'tok', expiresIn: 3600 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('oauth/token');
    expect(init?.method).toBe('POST');
    const body = String(init?.body);
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=my-id');
    expect(body).toContain('client_secret=my-secret');
  });

  it('throws with the server error_description on a non-200', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(401, { error_description: 'invalid client' }),
    ) as unknown as typeof fetch;
    const cc = new ClientCredentials('my-id', 'my-secret', noopCache);
    await expect(cc.fetchAccessToken()).rejects.toThrow('invalid client');
  });

  it('falls back to the error code when no description is present', async () => {
    global.fetch = jest.fn(async () => jsonResponse(400, { error: 'invalid_request' })) as unknown as typeof fetch;
    const cc = new ClientCredentials('my-id', 'my-secret', noopCache);
    await expect(cc.fetchAccessToken()).rejects.toThrow('invalid_request');
  });

  it('throws when the body is a 200 but not a valid OAuth token response', async () => {
    global.fetch = jest.fn(async () => jsonResponse(200, { not: 'a token' })) as unknown as typeof fetch;
    const cc = new ClientCredentials('my-id', 'my-secret', noopCache);
    await expect(cc.fetchAccessToken()).rejects.toThrow();
  });

  it('warns when constructed without a token cache', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    new ClientCredentials('my-id', 'my-secret');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
