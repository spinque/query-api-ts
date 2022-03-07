import { Authenticator, DEFAULT_AUTH_SERVER } from "./Authenticator";
import { join } from 'path';
import { isBrowser } from "browser-or-node";
import fetch, { Headers } from 'cross-fetch';

export class PKCE extends Authenticator {
  constructor(private clientId: string, private callback: string, private authServer?: string, private baseUrl?: string) {
    super();

    if (!isBrowser) {
      throw new Error('PKCE is only available for browser applications');
    }

    this.checkForCallback();
  }

  private checkForCallback() {
    // Get query parameters from URL
    const params = Object.fromEntries((new URLSearchParams(window.location.search)).entries());

    if (!params.code || !params.state) {
      return;
    }

    this._authInProgress = true;
    this.tradeCodeForToken(params.code, params.state).catch(() => this.authorize());
  }

  public async fetchAccessToken() {
    return this.authorize();
  }

  private async authorize() {
    const authServer = this.authServer || DEFAULT_AUTH_SERVER;

    // Create code verifier and challenge
    const verifier = createRandomString();
    const challenge = bufferToBase64UrlEncoded(await sha256(verifier));
    // Add a state string to prevent CSRF attacks
    const state = createRandomString();

    // Store the verifier and state so we can access it again after navigating the user to login.spinque.com
    localStorage.setItem('@spinque/query-api/pkce-verifier', verifier);
    localStorage.setItem('@spinque/query-api/pkce-state', state);

    const params = {
      response_type: 'code',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      client_id: this.clientId,
      redirect_uri: this.callback,
      audience: this.baseUrl,
      scope: '',
      state
    };
    let authorizationUrl = join(authServer, 'authorize');
    authorizationUrl += `?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;
    
    window.location.href = authorizationUrl;

    // tslint:disable-next-line: no-empty
    return new Promise(() => { }) as Promise<undefined>;
  }

  public async tradeCodeForToken(code: string, state: string) {
    if (this._accessToken) {
      return;
    }

    // Ensure state is equal to what we stored
    const storedState = localStorage.getItem('@spinque/query-api/pkce-state');
    if (storedState !== state) {
      throw new Error('PKCE state parameter does not match expected value.');
    }

    // Ensure we still got the code verifier
    const verifier = localStorage.getItem('@spinque/query-api/pkce-verifier');
    if (!verifier) {
      throw new Error('Unable to find code verifier in local storage.');
    }

    const authServer = this.authServer || DEFAULT_AUTH_SERVER;

    const body = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code_verifier: verifier,
      redirect_uri: this.callback,
      code
    };

    const response = await fetch(join(authServer, 'oauth', 'token'), {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: Object.entries(body)
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    });

    const json = await response.json();

    if (response.status === 403 && json && json.error && json.error === 'invalid_grant') {
      await this.fetchAccessToken();
    }

    if (response.status !== 200 || !json || !json.access_token || !json.expires_in) {
      throw new Error(json.error_description || json.error || response.status);
    }

    this.setAccessToken(json.access_token, json.expires_in);
  }
}


/**
 * Crypto stuff for PKCE
 * Most of this is taken from: https://github.com/auth0/auth0-spa-js (MIT licensed)
 */

 export const getCrypto = () => {
  return (window.crypto || (window as any).msCrypto) as Crypto;
};

export const getCryptoSubtle = () => {
  const crypto = getCrypto();
  return crypto.subtle || (crypto as any).webkitSubtle;
};

export const createRandomString = () => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
  let random = '';
  const randomValues = Array.from(
    getCrypto().getRandomValues(new Uint8Array(43))
  );
  randomValues.forEach(v => (random += charset[v % charset.length]));
  return random;
};

export const sha256 = async (s: string) => {
  const digestOp: any = getCryptoSubtle().digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(s)
  );
  if ((window as any).msCrypto) {
    return new Promise((res, rej) => {
      digestOp.oncomplete = (e: any) => {
        res(e.target.result);
      };

      digestOp.onerror = (e: ErrorEvent) => {
        rej(e.error);
      };

      digestOp.onabort = () => {
        rej('The digest operation was aborted');
      };
    });
  }

  return await digestOp;
};

export const bufferToBase64UrlEncoded = (input: number[] | Uint8Array) => {
  const ie11SafeInput = new Uint8Array(input);
  return urlEncodeB64(
    window.btoa(String.fromCharCode(...Array.from(ie11SafeInput)))
  );
};

const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = { '+': '-', '/': '_', '=': '' };
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};
