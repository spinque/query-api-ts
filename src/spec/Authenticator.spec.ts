import { Authenticator } from '../authentication/Authenticator';
import { TokenCache } from '../authentication/TokenCache';
import { AccessTokenResponse } from '../types';

const noopCache: TokenCache = { get: () => null, set: () => {} };

/**
 * Minimal concrete Authenticator whose token fetching is driven by an injectable implementation,
 * so we can exercise the in-flight/dedup/error behaviour of the base class in isolation.
 */
class TestAuthenticator extends Authenticator {
  public fetchMock: jest.Mock<Promise<AccessTokenResponse | undefined>, []>;

  constructor(impl: () => Promise<AccessTokenResponse | undefined>, cache: TokenCache = noopCache) {
    super(cache);
    this.fetchMock = jest.fn(impl);
  }

  public override fetchAccessToken(): Promise<AccessTokenResponse | undefined> {
    return this.fetchMock();
  }
}

describe('Authenticator.accessToken', () => {
  it('fetches and returns a fresh access token', async () => {
    const auth = new TestAuthenticator(async () => ({ accessToken: 'tok-1', expiresIn: 3600 }));
    await expect(auth.accessToken).resolves.toBe('tok-1');
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns the stored token without re-fetching while it is still valid', async () => {
    const auth = new TestAuthenticator(async () => ({ accessToken: 'tok-1', expiresIn: 3600 }));
    await auth.accessToken;
    await auth.accessToken;
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates concurrent authentication attempts into a single fetch', async () => {
    let resolve!: (r: AccessTokenResponse) => void;
    const auth = new TestAuthenticator(() => new Promise((r) => (resolve = r)));

    const a = auth.accessToken;
    const b = auth.accessToken;
    resolve({ accessToken: 'tok-1', expiresIn: 3600 });

    await expect(a).resolves.toBe('tok-1');
    await expect(b).resolves.toBe('tok-1');
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });

  // Regression: the previous one-shot wait-promise resolved only once and was reused across
  // cycles, so a second authentication could hand back the stale first token.
  it('re-authenticates when the stored token is about to expire (no stale token reuse)', async () => {
    let counter = 0;
    const auth = new TestAuthenticator(async () => ({ accessToken: `tok-${++counter}`, expiresIn: 5 }));

    await expect(auth.accessToken).resolves.toBe('tok-1');
    await expect(auth.accessToken).resolves.toBe('tok-2');
    expect(auth.fetchMock).toHaveBeenCalledTimes(2);
  });

  // Regression: a rejecting fetch used to leave the in-progress flag stuck true forever,
  // deadlocking every subsequent call.
  it('propagates a failed authentication and recovers on the next call (no deadlock)', async () => {
    let attempt = 0;
    const auth = new TestAuthenticator(async () => {
      attempt += 1;
      if (attempt === 1) {
        throw new Error('boom');
      }
      return { accessToken: 'tok-2', expiresIn: 3600 };
    });

    await expect(auth.accessToken).rejects.toThrow('boom');
    await expect(auth.accessToken).resolves.toBe('tok-2');
    expect(auth.fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shares a single rejection across concurrent callers', async () => {
    const auth = new TestAuthenticator(async () => {
      throw new Error('boom');
    });

    const a = auth.accessToken;
    const b = auth.accessToken;
    // Attach both handlers synchronously to avoid an unhandled rejection.
    const expectA = expect(a).rejects.toThrow('boom');
    const expectB = expect(b).rejects.toThrow('boom');
    await expectA;
    await expectB;
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });

  // Regression: when the fetch resolved to undefined, concurrent callers waiting on the poll
  // loop hung forever because the loop required a truthy access token.
  it('resolves undefined without hanging concurrent callers when no token is returned', async () => {
    let resolve!: (r: undefined) => void;
    const auth = new TestAuthenticator(() => new Promise((r) => (resolve = r)));

    const a = auth.accessToken;
    const b = auth.accessToken;
    resolve(undefined);

    await expect(a).resolves.toBeUndefined();
    await expect(b).resolves.toBeUndefined();
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });
});
