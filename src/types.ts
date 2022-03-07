export interface ApiConfig {
  baseUrl?: string;
  workspace?: string;
  config?: string;
  version?: string;
  api?: string;
  authentication?: ApiAuthenticationConfig;
}

export type ApiAuthenticationConfig = {
  type: 'client-credentials';
  authServer?: string;
  clientId: string;
  clientSecret: string;
  // } | {
  //   type: 'pkce';
};

export interface Query {
  endpoint: string;
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

export type ResponseType<T extends RequestType> = T extends 'results' ? ResultsResponse : StatisticsResponse;

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
