import fetch, { Headers } from 'cross-fetch';
import { ResultsResponse, StatisticsResponse } from '.';
import { Authenticator, ClientCredentials, PKCE } from './authentication';
import {
  ApiAuthenticationConfig,
  ApiConfig,
  EndpointNotFoundError,
  ErrorResponse,
  Query,
  RequestOptions,
  RequestType,
  ResponseType,
  ServerError,
  UnauthorizedError,
} from './types';
import { urlFromQueries } from './utils';

const DEFAULT_BASE_URL = 'https://rest.spinque.com/';

/**
 * Send queries to an API.
 */
export class Api {
  private _baseUrl = DEFAULT_BASE_URL;
  private _version? = '4';
  private _workspace?: string;
  private _api?: string;
  private _config? = 'default';
  private _authentication?: ApiAuthenticationConfig;
  private _authenticator?: Authenticator;

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
      if (apiConfig.authentication.type === 'client-credentials') {
        this._authentication = apiConfig.authentication;
        this._authenticator = new ClientCredentials(
          apiConfig.authentication.clientId,
          apiConfig.authentication.clientSecret,
          apiConfig.authentication.authServer,
          apiConfig.baseUrl || DEFAULT_BASE_URL,
        );
      }

      if (apiConfig.authentication.type === 'pkce') {
        this._authentication = apiConfig.authentication;
        this._authenticator = new PKCE(
          apiConfig.authentication.clientId,
          apiConfig.authentication.callback,
          apiConfig.authentication.authServer,
          apiConfig.baseUrl || DEFAULT_BASE_URL,
        );
      }
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

  async fetch(
    queries: Query | Query[],
    options?: RequestOptions,
    requestType?: RequestType,
  ): Promise<ResultsResponse | ErrorResponse>;
  async fetch(
    queries: Query | Query[],
    options: RequestOptions,
    requestType: 'statistics',
  ): Promise<StatisticsResponse | ErrorResponse>;
  async fetch<T>(
    queries: Query | Query[],
    options?: RequestOptions,
    requestType: RequestType = 'results',
  ): Promise<ResponseType<RequestType> | ErrorResponse> {
    if (!(queries instanceof Array)) {
      queries = [queries];
    }
    if (queries.length === 0) {
      throw new Error('Queries array is empty');
    }

    // Construct the URL to request from config and passed queries and options
    const url = urlFromQueries(this.apiConfig, queries, options, requestType);

    let requestInit: RequestInit = {};

    // Possibly set authentication details
    if (this.authentication && this._authenticator) {
      const token = await this._authenticator.accessToken;
      requestInit = { headers: new Headers({ Authorization: `Bearer ${token}` }) };
    }

    // Make the request
    return fetch(url, requestInit).then((res) => this.handleErrors<RequestType>(res));
  }

  private async handleErrors<T extends RequestType>(response: Response): Promise<ErrorResponse | ResponseType<T>> {
    const json = await response.json();

    if (response.status === 200) {
      return json as ResponseType<T>;
    }

    if (response.status === 401) {
      throw new UnauthorizedError(json.message, 401);
    }

    if (response.status === 400 && json.message.startsWith('no endpoint')) {
      throw new EndpointNotFoundError(json.message, 400);
    }

    if (response.status === 500) {
      throw new ServerError(json.message, 401);
    }

    throw new ErrorResponse('Unknown error: ' + (json.message || ''), response.status);
  }
}
