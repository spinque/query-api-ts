import { Api } from '../Api';
import {
  ApiNotFoundError,
  EndpointNotFoundError,
  ErrorResponse,
  ServerError,
  UnauthorizedError,
  WorkspaceConfigNotFoundError,
} from '../types';

/** Minimal Response-like object - handleResponse only reads `status` and `json()`. */
const jsonResponse = (status: number, body: unknown): Response =>
  ({ status, json: async () => body } as unknown as Response);

describe('Api.handleResponse (no authentication configured)', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  // An Api without authentication does not probe at construction and sends no Authorization header.
  const api = () => new Api({ workspace: 'ws', api: 'my-api' });

  const respondWith = (status: number, body: unknown) => {
    fetchMock = jest.fn(async () => jsonResponse(status, body));
    global.fetch = fetchMock as unknown as typeof fetch;
  };

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns the parsed body on 200', async () => {
    respondWith(200, { items: [1, 2] });
    await expect(api().fetch({ endpoint: 'e' })).resolves.toEqual({ items: [1, 2] });
  });

  it('throws UnauthorizedError on 401', async () => {
    respondWith(401, { message: 'nope' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws EndpointNotFoundError on a 400 mentioning "no endpoint"', async () => {
    respondWith(400, { message: 'There is no endpoint at this path' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(EndpointNotFoundError);
  });

  it('throws ServerError with status 500 on a 500 response', async () => {
    respondWith(500, { message: 'kaboom' });
    const error = await api()
      .fetch({ endpoint: 'e' })
      .catch((e) => e);
    expect(error).toBeInstanceOf(ServerError);
    expect(error.status).toBe(500);
    expect(error.message).toBe('kaboom');
  });

  it('throws ApiNotFoundError on a 404 mentioning "No such api"', async () => {
    respondWith(404, { message: 'No such api: movies' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(ApiNotFoundError);
  });

  it('throws WorkspaceConfigNotFoundError on a 404 mentioning "No such workspace configuration"', async () => {
    respondWith(404, { message: 'No such workspace configuration' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(WorkspaceConfigNotFoundError);
  });

  it('throws a generic ErrorResponse for unmapped statuses', async () => {
    respondWith(418, { message: 'teapot' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(ErrorResponse);
  });

  it('does not attach an Authorization header when no auth is configured', async () => {
    respondWith(200, { items: [] });
    await api().fetch({ endpoint: 'e' });
    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(new Headers(init?.headers).get('Authorization')).toBeNull();
  });

  it('does not retry a 401 when no authentication is configured', async () => {
    respondWith(401, { message: 'nope' });
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // Regression: handleResponse used to call json.message.includes(...) unconditionally, crashing
  // with a TypeError when the error body had no `message` field or was not JSON at all.
  it('does not crash on a 400 without a message (falls back to a generic ErrorResponse)', async () => {
    respondWith(400, {});
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(ErrorResponse);
  });

  it('does not crash on a 404 without a message (falls back to a generic ErrorResponse)', async () => {
    respondWith(404, {});
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(ErrorResponse);
  });

  it('still throws ServerError (status 500) on a 500 without a message', async () => {
    respondWith(500, {});
    const error = await api()
      .fetch({ endpoint: 'e' })
      .catch((e) => e);
    expect(error).toBeInstanceOf(ServerError);
    expect(error.status).toBe(500);
  });

  it('does not crash when the error body is not JSON', async () => {
    fetchMock = jest.fn(
      async () =>
        ({
          status: 500,
          json: async () => {
            throw new SyntaxError('Unexpected token < in JSON');
          },
        } as unknown as Response),
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    await expect(api().fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(ServerError);
  });
});
