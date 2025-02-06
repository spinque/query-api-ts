import { Authenticator, ClientCredentials, PKCE } from './authentication';
import {
  ApiAuthenticationConfig,
  ApiConfig,
  ApiNotFoundError,
  EndpointNotFoundError,
  ErrorResponse,
  Query,
  RequestOptions,
  RequestType,
  ResponseType,
  ResultItemTupleTypes,
  ServerError,
  UnauthorizedError,
  WorkspaceConfigNotFoundError,
} from './types';
import { apiUrl, urlFromQueries } from './utils';

// This is the default base URL to the Spinque Query API.
export const DEFAULT_BASE_URL = 'https://rest.spinque.com/';

/**
 * Send queries to the Spinque Query API using fetch.
 */
export class Api {
  /**
   * URL to the Spinque Query API deployment.
   *
   * @default https://rest.spinque.com/
   */
  baseUrl = DEFAULT_BASE_URL;

  /**
   * Version of the Spinque Query API deployment.
   *
   * @default 4
   */
  version? = '4';

  /**
   * Name of the Spinque workspace that should be addressed.
   * The Spinque Desk administrator working on your project knowns this value.
   */
  workspace?: string;

  /**
   * Name of the API that is provided by the workspace.
   * The Spinque Desk administrator working on your project knowns this value.
   */
  api?: string;

  /**
   * Name of the configuration of the Spinque workspace that should be used.
   * Usually, this is something like 'production', 'development' or 'default'.
   * The Spinque Desk administrator working on your project knowns this value.
   *
   * @default default
   */
  config? = 'default';

  private _authentication?: ApiAuthenticationConfig;
  private _authenticator?: Authenticator;

  constructor(apiConfig?: ApiConfig) {
    if (apiConfig && apiConfig.baseUrl) {
      this.baseUrl = apiConfig.baseUrl;
    }
    if (apiConfig && apiConfig.version) {
      this.version = apiConfig.version;
    }
    if (apiConfig && apiConfig.workspace) {
      this.workspace = apiConfig.workspace;
    }
    if (apiConfig && apiConfig.api) {
      this.api = apiConfig.api;
    }
    if (apiConfig && apiConfig.config) {
      this.config = apiConfig.config;
    }
    if (apiConfig && apiConfig.authentication) {
      if (apiConfig.authentication.type === 'client-credentials') {
        this._authentication = apiConfig.authentication;
        this._authenticator = new ClientCredentials(
          apiConfig.authentication.clientId,
          apiConfig.authentication.clientSecret,
          apiConfig.authentication.tokenCache,
          apiConfig.authentication.authServer,
          apiConfig.baseUrl,
        );
      }

      if (apiConfig.authentication.type === 'pkce') {
        this._authentication = apiConfig.authentication;
        this._authenticator = new PKCE(
          apiConfig.authentication.clientId,
          apiConfig.authentication.callback,
          apiConfig.authentication.authServer,
          apiConfig.authentication.tokenCache,
          apiConfig.baseUrl,
        );
      }

      // Skip if there is already an access token in the cache
      if (!apiConfig.authentication.tokenCache || !apiConfig.authentication.tokenCache.get()) {
        // Request the API information
        const url = apiUrl(this.apiConfig);
        fetch(url).then((res) => {
          if (res.status === 200) {
            // If this is allowed without authentication, we can forget about it
            this._authentication = undefined;
          } else {
            // If this is not allowed, request an access token
            this._authenticator?.accessToken.then(() => {});
          }
        });
      }
    }
  }

  get accessToken(): string | undefined {
    return this._authenticator?._accessToken;
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
   * Optionally the `fetch` RequestInit can be passed.
   */
  async fetch<T extends ResultItemTupleTypes[] = ResultItemTupleTypes[], R extends RequestType = 'results'>(
    queries: Query | Query[],
    options?: RequestOptions,
    requestType?: R,
    requestInit: RequestInit = {},
  ): Promise<ResponseType<R, T>> {
    // Convert single query to array of queries
    if (!(queries instanceof Array)) {
      queries = [queries];
    }
    if (queries.length === 0) {
      throw new Error('Queries array is empty');
    }

    // Construct the URL to request from config and passed queries and options
    const url = urlFromQueries(this.apiConfig, queries, options, requestType);

    // Possibly set authentication details
    if (this.authentication && this._authenticator) {
      const token = await this._authenticator.accessToken;
      requestInit = { headers: new Headers({ ...requestInit.headers, Authorization: `Bearer ${token}` }) };
    }

    // Make the request
    return fetch(url, requestInit).then((res) => this.handleResponse<R, T>(res));
  }

  /**
   * Handle the response of a fetch to Spinque Query API.
   */
  private async handleResponse<R extends RequestType, T = ResultItemTupleTypes[]>(
    response: Response,
  ): Promise<ResponseType<R, T>> {
    const json = await response.json();

    if (response.status === 200) {
      return json as ResponseType<R, T>;
    }

    if (response.status === 401) {
      throw new UnauthorizedError(json.message, 401);
    }

    if (response.status === 400 && json.message.includes('no endpoint')) {
      throw new EndpointNotFoundError(json.message, 400);
    }

    if (response.status === 500) {
      throw new ServerError(json.message, 401);
    }

    if (response.status === 404 && json.message.includes('No such api')) {
      throw new ApiNotFoundError(json.message, 404);
    }

    if (response.status === 404 && json.message.includes('No such workspace configuration')) {
      throw new WorkspaceConfigNotFoundError(json.message, 404);
    }

    throw new ErrorResponse('Unknown error: ' + (json.message || ''), response.status);
  }
}
