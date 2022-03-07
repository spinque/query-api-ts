import { Authenticator, DEFAULT_AUTH_SERVER } from "./Authenticator";
import { join } from 'path';
import { isBrowser } from "browser-or-node";
import fetch, { Headers } from 'cross-fetch';

export class ClientCredentials extends Authenticator {
  constructor(private clientId: string, private clientSecret: string, private authServer?: string, private baseUrl?: string) {
    super();

    if (isBrowser) {
      throw new Error('The Client Credentials Flow is only allowed for server applications.');
    }
  }

  public async fetchAccessToken() {
    const authServer = this.authServer || DEFAULT_AUTH_SERVER;

    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      audience: this.baseUrl,
    };

    const response = await fetch(join(authServer, 'oauth', 'token'), {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: Object.entries(body)
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    });

    const json = await response.json();

    if (response.status !== 200 || !json || !json.access_token || !json.expires_in) {
      throw new Error(json.error_description || json.error || response.status);
    }

    return {
      accessToken: json.access_token as string,
      expiresIn: json.expires_in as number
    };
  };
}