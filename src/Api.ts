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
  ResultItemTupleTypes,
  UnauthorizedError,
} from './types';
import { urlFromQueries } from './utils';

// This is the default base URL to the Spinque Query API.
const DEFAULT_BASE_URL = 'https://rest.spinque.com/';

/**
 * Send queries to the Spinque Query API using fetch.
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

  /**
   * Getter for baseUrl
   */
  get baseUrl(): string {
    return this._baseUrl;
  }

  /**
   * Setter for baseUrl
   */
  set baseUrl(value: string) {
    this._baseUrl = value;
  }

  /**
   * Getter for version
   */
  get version(): string | undefined {
    return this._version;
  }

  /**
   * Setter for version
   */
  set version(value: string | undefined) {
    this._version = value;
  }

  /**
   * Getter for workspace
   */
  get workspace(): string | undefined {
    return this._workspace;
  }

  /**
   * Setter for workspace
   */
  set workspace(value: string | undefined) {
    this._workspace = value;
  }

  /**
   * Getter for API name
   */
  get api(): string | undefined {
    return this._api;
  }

  /**
   * Setter for API name
   */
  set api(value: string | undefined) {
    this._api = value;
  }

  /**
   * Getter for configuration name
   */
  get config(): string | undefined {
    return this._config;
  }

  /**
   * Setter for configuration name
   */
  set config(value: string | undefined) {
    this._config = value;
  }

  /**
   * Getter for authentication configuration
   */
  get authentication(): ApiAuthenticationConfig | undefined {
    return this._authentication;
  }

  /**
   * Getter for authentication configuration
   */
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

  /**
   * Fetch a Query (or array of Queries). Takes optional RequestOptions and RequestType into account.
   */
  async fetch<T = ResultsResponse | ResultsResponse<ResultItemTupleTypes[]>>(
    queries: Query | Query[],
    options?: RequestOptions,
    requestType?: RequestType,
  ): Promise<ResultsResponse<T> | ErrorResponse>;
  async fetch(
    queries: Query | Query[],
    options: RequestOptions,
    requestType: 'statistics',
  ): Promise<StatisticsResponse | ErrorResponse>;
  async fetch<T = ResultsResponse | ResultsResponse<ResultItemTupleTypes[]>>(
    queries: Query | Query[],
    options?: RequestOptions,
    requestType: RequestType = 'results',
  ): Promise<ResponseType<RequestType, T> | ErrorResponse> {
    // Convert single query to array of queries
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
    return fetch(url, requestInit).then((res) => this.handleResponse<RequestType, T>(res));
  }

  /**
   * Handle the response of a fetch to Spinque Query API.
   */
  private async handleResponse<T extends RequestType, U = ResultsResponse | ResultsResponse<ResultItemTupleTypes[]>>(
    response: Response,
  ): Promise<ErrorResponse | ResponseType<T, U>> {
    const json = await response.json();

    if (response.status === 200) {
      return json as ResponseType<T, U>;
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
