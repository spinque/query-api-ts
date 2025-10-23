import { TokenCache } from './authentication';

/**
 * Configuration of an API to send queries to. Used to instantiate the Api class.
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

      /**
       * Implementation of a TokenCache. Defines a get and set method that put the token in some sort of storage.
       * This is especially useful during development, when in-memory caching doesn't work due to frequent server restarts.
       */
      tokenCache?: TokenCache;
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

      /**
       * Implementation of a TokenCache. Defines a get and set method that put the token in some sort of storage.
       * This is especially useful during development, when in-memory caching doesn't work due to frequent server restarts.
       */
      tokenCache?: TokenCache;
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

/**
 * Any request to the Spinque Query API must be one of these types.
 */
export enum RequestType {
  /**
   * Request a count of the results
   */
  Count = 'count',

  /**
   * Request statistics, which includes result count and probability distribution
   */
  Statistics = 'statistics',

  /**
   * Fetch a page with results, using the entity view formatter
   */
  ResultPage = 'resultpage',

  /**
   * Fetch a single item, using the entity view formatter
   */
  ResultItem = 'resultitem',

  /**
   * Fetch a page with results, using the result description formatter
   */
  Results = 'results',

  /**
   * Fetch a page with results, using the result description formatter, and include the total count
   */
  ResultsAndCount = 'results,count',

  /**
   * Fetch facet options for facets following the :FILTER convention
   */
  Options = 'options',
}

export interface CountAndOffset {
  // Number of items returned. Default value is 10. Should be between 1 and 100.
  count?: number;

  // Offset on the number of items returned. Default is 0. Should be 0 or more.
  offset?: number;
}

export type ResultsRequestOptions = CountAndOffset & {
  // Formatting of the results: json/xml/rdf/csv/xlsx. Default value is ‘json’. Note: XML is not enabled by default, and RDF can only be requested when ouput of strategy is [STRING,STRING,STRING]
  format?: 'json' | 'xml' | 'rdf' | 'csv' | 'xlsx';

  // Specifies whether items in a result-tuple are returned as an array (false) or as an object (true). This option was introduced because some programming environments struggle with arrays that contain heterogeneous items (mix of strings, numbers, arrays, objects).
  homogeneousArrays?: boolean;
};

export type ResultItemRequestOptions = {
  // Rank of the item to be returned. Defaults to 1.
  rank?: number;

  // Number of the column of the result that should be returned. Defaults to 1.
  column?: number;

  // Whether the options are fetched for a multi-select facet (e.g. multiple options can be selected)
  multiselect?: boolean;
};

export type OptionsRequestOptions = CountAndOffset & {
  // Whether the options are fetched for a multi-select facet (e.g. multiple options can be selected)
  multiselect?: boolean;
};

/**
 * Map from RequestType to a Response type
 */
type OptionsMap = {
  [RequestType.Count]: CountAndOffset;
  [RequestType.Statistics]: CountAndOffset;
  [RequestType.ResultPage]: CountAndOffset;
  [RequestType.ResultItem]: ResultItemRequestOptions;
  [RequestType.Results]: ResultsRequestOptions;
  [RequestType.ResultsAndCount]: ResultsRequestOptions;
  [RequestType.Options]: OptionsRequestOptions;
};

/**
 * ResponseType based on RequestType
 */
export type OptionsType<U extends RequestType> = U extends keyof ResponseMap ? OptionsMap[U] : never;

/**
 * Map from RequestType to a Response type
 */
type ResponseMap<T = TupleTypes[]> = {
  [RequestType.Count]: CountResponse;
  [RequestType.Statistics]: StatisticsResponse;
  [RequestType.ResultPage]: ResultsResponse<ResultObject[]>;
  [RequestType.ResultItem]: ResultObject;
  [RequestType.Results]: ResultsResponse<T>;
  [RequestType.ResultsAndCount]: ResultsAndCountResponse<T>;
  [RequestType.Options]: OptionsResponse;
};

export type ResponseTypes = ResponseMap[keyof ResponseMap];

/**
 * ResponseType based on RequestType
 */
export type ResponseType<U extends RequestType, T = TupleTypes[]> = U extends keyof ResponseMap
  ? ResponseMap<T>[U]
  : never;

/**
 * Data types known by Spinque.
 * OBJ is an object with attributes.
 * TUPLE_LIST is a list of tuples.
 * STRING, DATE, INTEGER, DOUBLE are simple data types.
 */
export type DataType = 'OBJ' | 'STRING' | 'DATE' | 'INTEGER' | 'DOUBLE' | 'TUPLE_LIST';

export type TupleTypes = string | number | SpinqueResultObject | ResultObject;

/**
 * Response to a Query that contains the results
 */
export interface ResultsResponse<T = TupleTypes[]> {
  // Number of results requested. This may be more than the actual number of items returned.
  // If 'count' is larger than the number of items in the response, you've reached the last page.
  count: number;
  // The result offset requested.
  offset: number;
  // The output type returned. Can be any combination of the data types.
  type: DataType[];
  // A list with result items.
  items: ResultItem<T>[];
}

export interface ResultItem<T = TupleTypes[]> {
  // The rank of this result item, starting with 1.
  rank: number;
  // The probability/score of this result item.
  probability: number;
  // The contents of this result item
  tuple: T;
}

/**
 * Output format of Spinque's OBJ type, using the result description formatter
 */
export interface SpinqueResultObject {
  /**
   * The unique identifier of the object.
   * Will always be a valid URI.
   */
  id: string;

  /**
   * Array of classes assigned to this object.
   *
   * If a value is in this list, then there is
   * a <https://www.w3.org/2000/01/rdf-schema#Class>
   * relation between that value and `id`.
   */
  class: string[];

  /**
   * Object with attribute names and values.
   * Values can be any valid JSON type.
   */
  attributes?: {
    [attributeName: string]: any;
  };
}

/**
 * Result object using entity view formatter
 */
export type ResultObject = { [key: string]: string | number | ResultObject };

/**
 * Response to a Query that contains statistics
 */
export interface StatisticsResponse {
  // The total number of results for this query
  total: number;
  // Array representing the distribution of probabilities.
  // Every 'cutoff' point is a probability value and 'numResults'
  // is the number of results that have at least this probability.
  stats: {
    // A probability value
    cutoff: string;
    // Number of results with at least the accompanying 'cutoff' value as probability.
    numResults: number;
  }[];
}

/**
 * Response to a Query that contains the count
 */
export interface CountResponse {
  // The total number of results for this query
  total: number;
}

// TODO: this is unexpected behaviour of the backend (CountResponse is expected). It will be resolved at some point but impacts the public API
export type ResultsAndCountResponse<T = TupleTypes[]> = [ResultsResponse<T>, StatisticsResponse];

/**
 * Response to a Query for facet options
 */
export interface OptionsResponse {
  /**
   * Name of the facet options endpoint
   */
  id: string;
  title: string;

  selected: {
    id: string;
    score: number;
    value: string;
    title: string;
  }[];

  options: {
    id: string;
    score: number;
    value: string;
    title: string;
  }[];
}

/**
 * Generic error response class. Is implemented by more specific error type classes.
 */
export class ErrorResponse {
  constructor(public message: string, public status: number) {}
}

/**
 * Error class used when Spinque cannot find the workspace configuration you requested.
 * The workspace or configuration might be misspelled or removed.
 */
export class WorkspaceConfigNotFoundError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

/**
 * Error class used when Spinque cannot find the API you requested.
 * The API might be misspelled or removed.
 */
export class ApiNotFoundError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

/**
 * Error class used when Spinque cannot find the endpoint you requested.
 * The endpoint might be misspelled or removed.
 */
export class EndpointNotFoundError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

/**
 * Error class used when you are not authorized to request results for
 * this workspace, API or endpoint.
 */
export class UnauthorizedError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

/**
 * Error class when something fails on the side of Spinque. Please contact
 * your system administrator when this happens.
 */
export class ServerError implements ErrorResponse {
  constructor(public message: string, public status: number) {}
}

// Types for FacetedSearch/FilteredSearch convention

export type Filter = FacetFilter | ParameterizedFilter | SimpleFilter;

export enum FacetType {
  single = 'single',
  multiple = 'multiple',
}

/**
 * Endpoints to a) retrieve filter options given a result query stack,
 * and b) filter results based on a selection of options.
 *
 * Currently, this interface only supports:
 *  - facets without a parameter for the optionsEndpoint
 *  - facets with only one parameter for the filterEndpoint
 *  - for facets with type=multiple: only disjunctive facets
 */
export interface FacetFilter {
  // Name of the endpoint that returns the options to be displayed in the facet
  optionsEndpoint: string;
  // Name of the endpoint that filters search results
  filterEndpoint: string;
  // Name of the parameter that is expected by the filterEndpoint
  filterParameterName: string;
  // Optional value of the parameter expected by the filterEndpoint
  filterParameterValue: string | number | undefined;
  // Type of this facet: 'single' means only one value can be selected,
  // 'multiple' means multiple values may be selected.
  type: FacetType;
  // Should the facet selection reset when the search query changes?
  resetOnQueryChange: boolean;
}

/**
 * Endpoint that filters results based on the value of its parameter.
 */
export interface ParameterizedFilter {
  // Name of the endpoint that filters search results
  filterEndpoint: string;
  // Name of the parameter that is expected by the filterEndpoint
  filterParameterName: string;
  // Optional value of the parameter expected by the filterEndpoint
  filterParameterValue: string | number | undefined;
  // Should the facet selection reset when the search query changes?
  resetOnQueryChange: boolean;
}

/**
 * Endpoint that filters results.
 */
export interface SimpleFilter {
  // Name of the endpoint that filters search results
  filterEndpoint: string;
}
