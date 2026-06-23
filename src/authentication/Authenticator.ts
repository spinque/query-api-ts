import { AccessTokenResponse } from '../types';
import { isBrowser } from '../utils';
import { TokenCache, localStorageTokenCache } from './TokenCache';

export const DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';
export const DEFAULT_AUDIENCE = 'https://rest.spinque.com/';

/**
 * Abstract class with utitily functions for working with access tokens such as storage
 */
export abstract class Authenticator {
  _accessToken?: string;
  _expires?: number;

  /**
   * The authentication that is currently running, if any. Concurrent callers of
   * {@link accessToken} - and out-of-band flows such as the PKCE callback - share this
   * single promise instead of starting competing authentications. It is always cleared once
   * settled (see {@link track}), including on failure, so a failed attempt never permanently
   * blocks future authentication.
   */
  private _inFlight?: Promise<string | undefined>;

  constructor(private _tokenCache: TokenCache) {
    // First thing to do: check if there's an access token in localStorage
    const cachedToken = this._tokenCache.get();

    if (cachedToken) {
      // Set it as class property
      this._accessToken = cachedToken.accessToken;
      this._expires = cachedToken.expires;
    }
  }

  /**
   * Promise that will resolve with an access token if available or undefined otherwise.
   * This will try to fetch a new access token if:
   *  - the specific {@link Authenticator} implements the fetchAccessToken method, and
   *  - no unexpired access token is stored in this {@link Authenticator} instance or {@link TokenCache}.
   */
  public get accessToken(): Promise<string | undefined> {
    // If the class already stores an access token, return it
    // Discard the token if the lifetime is less than 10 seconds
    if (this._accessToken && this._expires && this._expires > Date.now() + 10_000) {
      return Promise.resolve(this._accessToken);
    }
    // If an authentication is already in flight, wait for that one instead of starting another
    if (this._inFlight) {
      return this._inFlight;
    }
    // Otherwise, start a new authentication
    return this.track(
      this.fetchAccessToken().then((res: AccessTokenResponse | undefined) => {
        if (res && 'accessToken' in res && 'expiresIn' in res) {
          this.setAccessToken(res.accessToken, res.expiresIn);
          return res.accessToken;
        }
        return undefined;
      }),
    );
  }

  /**
   * Registers `authentication` as the in-flight authentication so that other callers of
   * {@link accessToken} wait for it instead of starting their own. The in-flight marker is
   * cleared as soon as the promise settles - whether it resolves or rejects - so a failure
   * never deadlocks subsequent authentication attempts. Rejections are propagated to callers.
   *
   * Used both for authentications started by the {@link accessToken} getter and for flows that
   * obtain a token out-of-band (e.g. the PKCE callback trading a code for a token).
   */
  protected track(authentication: Promise<string | undefined>): Promise<string | undefined> {
    const tracked: Promise<string | undefined> = authentication.then(
      (token) => {
        if (this._inFlight === tracked) {
          this._inFlight = undefined;
        }
        return token;
      },
      (error) => {
        if (this._inFlight === tracked) {
          this._inFlight = undefined;
        }
        throw error;
      },
    );
    this._inFlight = tracked;
    return tracked;
  }

  /**
   * Puts an access token and the expiration time in storage for usage when calling Spinque Query API
   */
  public setAccessToken(accessToken: string, expiresIn: number) {
    this._accessToken = accessToken;
    this._expires = Date.now() + expiresIn * 1000;
    this._tokenCache.set(this._accessToken, this._expires);
  }

  /**
   * Discards the currently stored access token, both in memory and from the token cache, so that
   * the next read of {@link accessToken} fetches a fresh one. Used to recover from a token that
   * the server rejected (HTTP 401) even though it had not yet expired client-side. Any
   * authentication that is already in flight is left untouched - joining it still yields a fresh
   * token.
   */
  public invalidate(): void {
    this._accessToken = undefined;
    this._expires = undefined;
    this._tokenCache.delete?.();
  }

  /**
   * Abstract method that must be implemented by extending classes for specific OAuth 2.0 grants/flows.
   */
  abstract fetchAccessToken(): Promise<AccessTokenResponse | undefined>;
}
