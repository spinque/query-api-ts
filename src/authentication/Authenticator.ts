import { getFromStorage, putInStorage } from '..';

/**
 * Abstract class with utitily functions for working with access tokens such as storage
 */
export abstract class Authenticator {
  _authInProgress = true;
  _accessToken?: string;
  _expires?: number;

  constructor(public _tokenCachePath?: string) {
    // First thing to do: check if there's an access token in localStorage
    const res = getFromStorage(this._tokenCachePath);
    if (res) {
      // Set it as class property
      this._accessToken = res.accessToken;
      this._expires = res.expires;
      this._authInProgress = false;
    } else {
      this._authInProgress = false;
    }
  }

  /**
   * A Promise that delays any operation until an access token is set (with intervals of 50ms)
   * This is used to delay incoming request from our app when an access token is already
   * being requested but has not yet been received.
   */
  private _waitForAccessToken: Promise<string> = new Promise((resolve) => {
    const wait = () => {
      setTimeout(() => (!this._authInProgress && this._accessToken ? resolve(this._accessToken) : wait()), 50);
    };
    wait();
  });

  /**
   * Promise that will resolve with an access token if available or undefined otherwise.
   * This will try to fetch a new access token if:
   *  - the class implements the fetchAccessToken method
   *  - no unexpired access token is stored in this class
   */
  public get accessToken(): Promise<string | undefined> {
    // If the class already stores an access token, return it
    if (this._accessToken && this._expires && this._expires > Date.now() + 1000) {
      return Promise.resolve(this._accessToken);
    }
    // If the class is already authenticating, wait for it
    if (this._authInProgress) {
      return this._waitForAccessToken;
    }

    this._authInProgress = true;

    return this.fetchAccessToken().then((res: { accessToken: string; expiresIn: number } | undefined) => {
      this._authInProgress = false;
      if (res && 'accessToken' in res && 'expiresIn' in res) {
        this.setAccessToken(res.accessToken, res.expiresIn);
        return this._accessToken;
      } else {
        return undefined;
      }
    });
  }

  /**
   * Puts an access token and the expiration time in storage for usage when calling Spinque Query API
   */
  public setAccessToken(accessToken: string, expiresIn: number) {
    this._accessToken = accessToken;
    this._expires = Date.now() + expiresIn * 1000;
    putInStorage(this._tokenCachePath, this._accessToken, this._expires);
    this._authInProgress = false;
  }

  /**
   * Abstract method that must be implemented by extending classes for specific OAuth 2.0 grants/flows.
   */
  abstract fetchAccessToken(): Promise<{ accessToken: string; expiresIn: number } | undefined>;
}
