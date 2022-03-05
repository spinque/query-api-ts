import { ApiAuthenticationConfig, ApiConfig, Query, RequestOptions } from './types';
import fetch, { Headers } from 'cross-fetch';
import { urlFromQueries } from './utils';
import { isBrowser } from 'browser-or-node';
import { join } from 'path';

export const DEFAULT_BASE_URL = 'https://rest.spinque.com/';
export const DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';

export class Api {
  _baseUrl = DEFAULT_BASE_URL;
  _version? = '4';
  _workspace?: string;
  _api?: string;
  _config? = 'default';
  _authentication?: ApiAuthenticationConfig;

  _accessToken?: string;
  _expires?: number;

  constructor(apiConfig?: ApiConfig) {
    if (apiConfig && apiConfig.baseUrl) {
      this._baseUrl = apiConfig.baseUrl;
    }
    if (apiConfig && apiConfig.version) {
      this._version = apiConfig.version;
    }
    if (apiConfig && apiConfig.workspace) {
      this._workspace = apiConfig.workspace;
    }
    if (apiConfig && apiConfig.api) {
      this._api = apiConfig.api;
    }
    if (apiConfig && apiConfig.config) {
      this._config = apiConfig.config;
    }
    if (apiConfig && apiConfig.authentication) {
      // if (isBrowser && apiConfig.authentication.type === 'client-credentials') {
      //   throw new Error('The Client Credentials Flow is only allowed for server application.');
      // }

      this._authentication = apiConfig.authentication;
    }
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  set baseUrl(value: string) {
    this._baseUrl = value;
  }

  get version(): string | undefined {
    return this._version;
  }

  set version(value: string | undefined) {
    this._version = value;
  }

  get workspace(): string | undefined {
    return this._workspace;
  }

  set workspace(value: string | undefined) {
    this._workspace = value;
  }

  get api(): string | undefined {
    return this._api;
  }

  set api(value: string | undefined) {
    this._api = value;
  }

  get config(): string | undefined {
    return this._config;
  }

  set config(value: string | undefined) {
    this._config = value;
  }

  get authentication(): ApiAuthenticationConfig | undefined {
    return this._authentication;
  }

  set authetication(value: ApiAuthenticationConfig | undefined) {
    if (value && isBrowser && value.type === 'client-credentials') {
      throw new Error('The Client Credentials Flow is only allowed for server application.');
    }
    this._authentication = value;
  }

  get apiConfig(): ApiConfig {
    return {
      workspace: this.workspace,
      version: this.version,
      baseUrl: this.baseUrl,
      config: this.config,
      api: this.api,
      authentication: this.authentication,
    };
  }

  async fetch(queries: Query[], options?: RequestOptions): Promise<Response> {
    if (queries.length === 0) {
      throw new Error('Queries array is empty');
    }

    const url = urlFromQueries(this.apiConfig, queries, options);

    if (this.authentication) {
      const accessToken = await this.getAccessToken();
      return fetch(url, {
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
      });
    } else {
      return fetch(url);
    }
  }

  async getAccessToken(): Promise<any> {
    if (!this.authentication) {
      throw new Error('API configuration does not contain authentication details');
    }
    if (this._accessToken && this._expires && this._expires > Date.now() + 1000) {
      return Promise.resolve(this._accessToken);
    }

    if (this.authentication.type === 'client-credentials') {
      const authServer = this.authentication.authServer || DEFAULT_AUTH_SERVER;

      const body = {
        grant_type: 'client_credentials',
        client_id: this.authentication.clientId,
        client_secret: this.authentication.clientSecret,
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

      this._accessToken = json.access_token;
      this._expires = Date.now() + json.expires_in;

      return this._accessToken;
    } else {
      throw new Error('Authentication scheme not implemented yet');
    }
  }
}
