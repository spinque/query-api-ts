/**
 * Configuration of an API to send queries to.
 */
export interface ApiConfig {
  /**
   * URL to the Spinque Query API deployment.
   *
   * @default https://rest.spinque.com/
   */
  baseUrl?: string;

  /**
   * Version of the Spinque Query API deployment.
   *
   * @default 4
   */
  version?: string;

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
  config?: string;

  /**
   * Authentication that should be used when querying the API.
   */
  authentication?: ApiAuthenticationConfig;
}

/**
 * Authentication configuration for an API.
 */
export type ApiAuthenticationConfig =
  | {
      /**
       * OAuth 2.0 Client Credentials flow.
       * Uses Client ID and Client Secret to directly request an access token.
       *
       * @see https://oauth.net/2/grant-types/client-credentials/
       */
      type: 'client-credentials';

      /**
       * URL to the authentication server to use.
       *
       * @default https://login.spinque.com/
       */
      authServer?: string;
      clientId: string;
      clientSecret: string;
    }
  | {
      /**
       * OAuth 2.0 PKCE flow.
       *
       * @see https://oauth.net/2/pkce/
       */
      type: 'pkce';

      /**
       * URL to the authentication server to use.
       *
       * @default https://login.spinque.com/
       */
      authServer?: string;
      clientId: string;
      callback: string;
    };

/**
 * Represent a single query, consisting of an endpoint name and a map of parameters (name and value).
 */
export interface Query {
  /**
   * Name of the endpoint.
   */
  endpoint: string;

  /**
   * Map of filled parameters (name and value).
   */
  parameters?: {
    [name: string]: string;
  };
}

export type RequestType = 'results' | 'statistics';

export interface RequestOptions {
  // Number of items returned. Default value is 10. Should be between 1 and 100.
  count?: number;

  // Offset on the number of items returned. Default is 0. Should be 0 or more.
  offset?: number;

  // Formatting of the results: json/xml/rdf/csv/xlsx. Default value is ‘json’. Note: XML is not enabled by default, and RDF can only be requested when ouput of strategy is [STRING,STRING,STRING]
  format?: 'json' | 'xml' | 'rdf' | 'csv' | 'xlsx';

  // Level of the result descriptions. Default value is 1. Should be 0 or more.
  level?: number;

  // Specifies whether items in a result-tuple are returned as an array (false) or as an object (true). This option was introduced because some programming environments struggle with arrays that contain heterogeneous items (mix of strings, numbers, arrays, objects).
  homogeneousArrays?: boolean;
}

/**
 * ResponseType based on RequestType
 */
export type ResponseType<T extends RequestType> = T extends 'results' ? ResultsResponse : StatisticsResponse;

/**
 * Response to a Query that contains the results
 */
export interface ResultsResponse {
  count: number;
  offset: number;
  type: string[];
  items: {
    rank: number;
    probability: number;
    tuple: any[];
  }[];
}

/**
 * Response to a Query that contains statistics
 */
export interface StatisticsResponse {
  total: number;
  stats: {
    cutoff: string;
    numResults: number;
  }[];
}

export class ErrorResponse {
  constructor(public message: string, public status: number) {}
}

// tslint:disable-next-line: max-classes-per-file
export class EndpointNotFoundError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

// tslint:disable-next-line: max-classes-per-file
export class UnauthorizedError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

// tslint:disable-next-line: max-classes-per-file
export class ServerError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}
