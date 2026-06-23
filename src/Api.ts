import { Authenticator, ClientCredentials, PKCE } from './authentication';
import {
  ApiAuthenticationConfig,
  ApiConfig,
  ApiNotFoundError,
  EndpointNotFoundError,
  ErrorResponse,
  Query,
  RequestType,
  ResponseType,
  TupleTypes,
  ServerError,
  UnauthorizedError,
  WorkspaceConfigNotFoundError,
  OptionsType,
  ResponseTypes,
  AccessTokenResponse,
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

  private _isInitialized: Promise<boolean>;

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
    }

    // If auth is configured but there is not token yet..
    if (
      apiConfig?.authentication &&
      (!apiConfig.authentication.tokenCache || !apiConfig.authentication.tokenCache.get())
    ) {
      // Request the API information to see if auth is actually needed
      const url = apiUrl(this.apiConfig);
      // Save the status in _isInitialized to delay incoming fetch requests until we know if auth is needed
      this._isInitialized = fetch(url).then((res) => {
        if (res.status === 200 || !this._authenticator) {
          // If this is allowed without authentication, we can forget about the auth confug
          this._authentication = undefined;
          return new Promise((resolve) => resolve(true));
        } else {
          // If this is not allowed, request an access token
          return this._authenticator?.accessToken.then(() => true);
        }
      });
    } else {
      this._isInitialized = new Promise((resolve) => resolve(true));
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
   * Fetch a url directly, circumventing all {@link Api} configuration except authentication.
   * Useful when wanting to tap into @spinque/query-api's authentication service while also
   * wanting to construct your own URLs. This function does not check whether the provided URL
   * is a valid request to Spinque, take caution.
   */
  async fetchUrl<R extends ResponseTypes>(url: string, requestInit: RequestInit = {}) {
    await this._isInitialized;
    return this._authenticatedFetch<R>(url, requestInit);
  }

  /**
   * Fetch a Query (or array of Queries). Takes optional RequestOptions and RequestType into account.
   * Optionally the `fetch` RequestInit can be passed (see https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
   */
  async fetch<
    O extends OptionsType<R>,
    T extends TupleTypes[] = TupleTypes[],
    R extends RequestType = RequestType.Results,
  >(
    queries: Query | Query[],
    options?: O,
    requestType?: R,
    requestInit: RequestInit = {},
  ): Promise<ResponseType<R, T>> {
    await this._isInitialized;

    // Convert single query to array of queries
    if (!(queries instanceof Array)) {
      queries = [queries];
    }
    if (queries.length === 0) {
      throw new Error('Queries array is empty');
    }

    // Construct the URL to request from config and passed queries and options
    const url = urlFromQueries(this.apiConfig, queries, options, requestType);

    // Make the request
    return this._authenticatedFetch<ResponseType<R, T>>(url, requestInit);
  }

  /**
   * Sends an authenticated request.
   *
   * Automatically retries once on 401 for Client Credentials. Fails with
   * {@link UnauthorizedError} for other auth flows or if the retry also 401s.
   */
  private async _authenticatedFetch<R extends ResponseTypes>(url: string, requestInit: RequestInit): Promise<R> {
    // Resolve the authenticator to use, if authentication is currently required.
    const authenticator = this.authentication ? this._authenticator : undefined;

    const send = async (refresh: boolean): Promise<Response> => {
      if (!authenticator) {
        return fetch(url, requestInit);
      }
      if (refresh) {
        // Drop the token the server just rejected so a fresh one is fetched.
        authenticator.invalidate();
      }
      const token = await authenticator.accessToken;
      // Build headers from the original requestInit each time so retries don't accumulate headers.
      return fetch(url, {
        ...requestInit,
        headers: new Headers({ ...requestInit.headers, Authorization: `Bearer ${token}` }),
      });
    };

    let response = await send(false);

    // The server rejected a token we still considered valid. Only the Client Credentials grant
    // can fetch a new one non-interactively, so refresh and replay the request once.
    if (response.status === 401 && authenticator instanceof ClientCredentials) {
      response = await send(true);
    }

    return this.handleResponse<R>(response);
  }

  public async fetchAccessToken(): Promise<AccessTokenResponse | undefined> {
    return await this._authenticator?.fetchAccessToken();
  }

  /**
   * Handle the response of a fetch to Spinque Query API.
   */
  private async handleResponse<R extends ResponseTypes>(response: Response): Promise<R> {
    // Parse the body defensively: some error responses carry no (JSON) body at all.
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      json = undefined;
    }

    if (response.status === 200) {
      return json as R;
    }

    // Error bodies may omit `message` entirely; fall back to an empty string so the substring
    // checks below never throw on a missing field.
    const message = (json as { message?: string } | null)?.message ?? '';

    if (response.status === 401) {
      throw new UnauthorizedError(message, 401);
    }

    if (response.status === 400 && message.includes('no endpoint')) {
      throw new EndpointNotFoundError(message, 400);
    }

    if (response.status === 500) {
      throw new ServerError(message, 500);
    }

    if (response.status === 404 && message.includes('No such api')) {
      throw new ApiNotFoundError(message, 404);
    }

    if (response.status === 404 && message.includes('No such workspace configuration')) {
      throw new WorkspaceConfigNotFoundError(message, 404);
    }

    throw new ErrorResponse('Unknown error: ' + message, response.status);
  }
}
