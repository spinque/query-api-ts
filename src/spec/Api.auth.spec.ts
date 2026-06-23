import { Api } from '../Api';
import { TokenCache } from '../authentication/TokenCache';
import { UnauthorizedError } from '../types';

/** Builds a minimal Response-like object - handleResponse only reads `status` and `json()`. */
const jsonResponse = (status: number, body: unknown): Response =>
  ({ status, json: async () => body } as unknown as Response);

interface MockState {
  tokenCalls: number;
  queryStatuses: number[]; // status returned for each successive non-token request
}

/**
 * Installs a global fetch mock that answers the OAuth token endpoint with a fresh token and
 * answers query requests with the next status from `queryStatuses` (200 bodies otherwise).
 */
const installFetchMock = (state: MockState) => {
  let queryCall = 0;
  const fetchMock = jest.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('oauth/token')) {
      state.tokenCalls += 1;
      return jsonResponse(200, { access_token: `fresh-token-${state.tokenCalls}`, expires_in: 3600 });
    }
    const status = state.queryStatuses[queryCall] ?? 200;
    queryCall += 1;
    return status === 200 ? jsonResponse(200, { items: [] }) : jsonResponse(status, { message: 'Token rejected' });
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const makeApi = (tokenCache: TokenCache) =>
  new Api({
    workspace: 'ws',
    api: 'my-api',
    authentication: { type: 'client-credentials', clientId: 'id', clientSecret: 'secret', tokenCache },
  });

describe('Api authentication - 401 refresh-and-retry (Client Credentials)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('refreshes the token and replays the request once on a 401', async () => {
    const state: MockState = { tokenCalls: 0, queryStatuses: [401, 200] };
    const fetchMock = installFetchMock(state);
    const tokenCache: TokenCache = {
      // A token that is still valid client-side but the server will reject.
      get: () => ({ accessToken: 'stale-token', expires: Date.now() + 3_600_000 }),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const api = makeApi(tokenCache);

    await expect(api.fetch({ endpoint: 'e' })).resolves.toEqual({ items: [] });

    // One query 401, one token refresh, one replayed query = 3 fetches total.
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(state.tokenCalls).toBe(1);
    // The rejected token was cleared from the cache, and the fresh one is now stored/active.
    expect(tokenCache.delete).toHaveBeenCalledTimes(1);
    expect(api.accessToken).toBe('fresh-token-1');
  });

  it('also retries fetchUrl on a 401', async () => {
    const state: MockState = { tokenCalls: 0, queryStatuses: [401, 200] };
    const fetchMock = installFetchMock(state);
    const tokenCache: TokenCache = {
      get: () => ({ accessToken: 'stale-token', expires: Date.now() + 3_600_000 }),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const api = makeApi(tokenCache);

    await expect(api.fetchUrl('https://rest.spinque.com/api/some/path')).resolves.toEqual({ items: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(state.tokenCalls).toBe(1);
  });

  it('caps at a single retry: a second 401 surfaces UnauthorizedError', async () => {
    const state: MockState = { tokenCalls: 0, queryStatuses: [401, 401, 401] };
    const fetchMock = installFetchMock(state);
    const tokenCache: TokenCache = {
      get: () => ({ accessToken: 'stale-token', expires: Date.now() + 3_600_000 }),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const api = makeApi(tokenCache);

    await expect(api.fetch({ endpoint: 'e' })).rejects.toBeInstanceOf(UnauthorizedError);

    // Exactly two query attempts (original + one retry) plus one refresh - no further retries.
    const queryCalls = fetchMock.mock.calls.filter(([input]) => !String(input).includes('oauth/token'));
    expect(queryCalls).toHaveLength(2);
    expect(state.tokenCalls).toBe(1);
  });

  it('uses the cached token and does not refresh or retry when the request succeeds', async () => {
    const state: MockState = { tokenCalls: 0, queryStatuses: [200] };
    const fetchMock = installFetchMock(state);
    const tokenCache: TokenCache = {
      get: () => ({ accessToken: 'cached-token', expires: Date.now() + 3_600_000 }),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const api = makeApi(tokenCache);

    await expect(api.fetch({ endpoint: 'e' })).resolves.toEqual({ items: [] });

    // A single query request: no token endpoint call, no retry.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(state.tokenCalls).toBe(0);
    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer cached-token');
  });

  it('surfaces a refresh failure encountered while retrying a 401', async () => {
    let queryCall = 0;
    const fetchMock = jest.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('oauth/token')) {
        // The refresh itself fails.
        return jsonResponse(401, { error_description: 'refresh failed' });
      }
      queryCall += 1;
      return jsonResponse(401, { message: 'rejected' });
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const tokenCache: TokenCache = {
      get: () => ({ accessToken: 'stale-token', expires: Date.now() + 3_600_000 }),
      set: jest.fn(),
      delete: jest.fn(),
    };
    const api = makeApi(tokenCache);

    // The auth-server error from the failed refresh propagates (masking the original 401).
    await expect(api.fetch({ endpoint: 'e' })).rejects.toThrow('refresh failed');
    // The replay never happened because the refresh threw first.
    expect(queryCall).toBe(1);
  });
});

describe('Api construction probe (auth configured, no cached token)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const makeUncachedApi = () =>
    new Api({
      workspace: 'ws',
      api: 'my-api',
      authentication: { type: 'client-credentials', clientId: 'id', clientSecret: 'secret' },
    });

  it('treats the API as public when the probe returns 200 (clears auth, sends no token)', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('oauth/token')) {
        return jsonResponse(200, { access_token: 'unused', expires_in: 3600 });
      }
      return jsonResponse(200, { items: [] });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const api = makeUncachedApi();
    await expect(api.fetch({ endpoint: 'e' })).resolves.toEqual({ items: [] });

    expect(api.authentication).toBeUndefined();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('oauth/token'))).toBe(false);
  });

  it('fetches a token at construction when the probe indicates auth is required', async () => {
    let apiHostCall = 0;
    const fetchMock = jest.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('oauth/token')) {
        return jsonResponse(200, { access_token: 'tok', expires_in: 3600 });
      }
      apiHostCall += 1;
      // First API-host call is the construction probe (auth required), the second is the query.
      return apiHostCall === 1 ? jsonResponse(401, { message: 'auth required' }) : jsonResponse(200, { items: [] });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const api = makeUncachedApi();
    await expect(api.fetch({ endpoint: 'e' })).resolves.toEqual({ items: [] });

    expect(api.authentication).toBeDefined();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('oauth/token'))).toBe(true);
    // The query carried the token fetched at construction.
    const apiCalls = fetchMock.mock.calls.filter(([input]) => !String(input).includes('oauth/token'));
    const [, queryInit] = apiCalls[apiCalls.length - 1];
    expect(new Headers(queryInit?.headers).get('Authorization')).toBe('Bearer tok');
  });
});
