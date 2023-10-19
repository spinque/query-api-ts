import { Authenticator, DEFAULT_AUTH_SERVER } from './Authenticator';
import { join } from '../utils';
import { isBrowser } from 'browser-or-node';

/**
 * An Authenticator class for the OAuth 2.0 Client Credentials grant.
 */
export class ClientCredentials extends Authenticator {
  constructor(
    // Client ID from Spinque Desk > Settings > Team Members > System-to-System account
    private clientId: string,
    // Client Secret from Spinque Desk > Settings > Team Members > System-to-System account
    private clientSecret: string,
    // URL to the Spinque Authorization server, default is https://login.spinque.com/
    private authServer?: string,
    // Optional path to store the authentication token and make it persistent through server restarts
    private tokenCachePath?: string,
    // URL to the Spinque Query API, used as OAuth 2.0 scope, default is https://rest.spinque.com/
    private baseUrl?: string,
  ) {
    super(tokenCachePath);
    if (isBrowser) {
      throw new Error('The Client Credentials Flow is only allowed for server applications.');
    }
  }

  /**
   * This method fetches an access token using the OAuth 2.0 Client Credentials grant and returns it
   */
  public async fetchAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
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
      // URL Encode the body
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
      expiresIn: json.expires_in as number,
    };
  }
}
