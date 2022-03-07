import { isBrowser } from 'browser-or-node';

export const DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';

export abstract class Authenticator {
  _authInProgress = true;
  _accessToken?: string;
  _expires?: number;

  constructor() {
    // First thing to do: check if there's an access token in localStorage
    const res = this.getFromStorage();

    if (res) {
      this._accessToken = res.accessToken;
      this._expires = res.expires;
      this._authInProgress = false;
    } else {
      this._authInProgress = false;
    }
  }

  public get accessToken(): Promise<string | undefined> {
    // If the class already stores an access token, return it
    if (this._accessToken && this._expires && this._expires > (Date.now() + 1000)) {
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

  public setAccessToken(accessToken: string, expiresIn: number) {
    this._accessToken = accessToken;
    this._expires = Date.now() + expiresIn;
    this.putInStorage(this._accessToken, this._expires);
    this._authInProgress = false;
  }

  private _waitForAccessToken: Promise<string> = new Promise((resolve) => {
    const wait = () => {
      setTimeout(() => (!this._authInProgress && this._accessToken ? resolve(this._accessToken) : wait()), 100);
    };
    wait();
  });

  private putInStorage(accessToken: string, expires: number) {
    if (!isBrowser || !localStorage) {
      return;
    }
    // TODO: configure keys
    localStorage.setItem('@spinque/query-api/access-token', accessToken);
    localStorage.setItem('@spinque/query-api/expires', `${expires}`);
  }

  private getFromStorage() {
    // Localstorage is only available for browser applications
    if (!isBrowser || !localStorage) {
      return null;
    }
    try {
      const accessToken = localStorage.getItem('@spinque/query-api/access-token');
      const expires = parseInt(localStorage.getItem('@spinque/query-api/expires') || '', 10);
      if (accessToken && expires && expires > (Date.now() + 1000)) {
        return { accessToken, expires };
      } else {
        localStorage.removeItem('@spinque/query-api/access-token');
        localStorage.removeItem('@spinque/query-api/expires');
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  abstract fetchAccessToken(): Promise<{ accessToken: string; expiresIn: number } | undefined>;
}
