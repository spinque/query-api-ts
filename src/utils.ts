import { ApiConfig, Query } from '.';
import { join } from 'path';
import { RequestOptions, RequestType } from './types';

/**
 * Takes an array of Query objects and returns the path they would represent in a Query API request URL.
 */
export const pathFromQueries = (queries: Query[]): string => {
  return join(...queries.map(pathFromQuery));
};

/**
 * Takes a Query and returns the path it would represent in a Query API request URL.
 */
export const pathFromQuery = (query: Query): string => {
  const parts = ['e', encodeURIComponent(query.endpoint)];
  if (query.parameters) {
    Object.entries(query.parameters).forEach(([name, value]) => {
      parts.push('p', name, encodeURIComponent(value));
    });
  }
  return join(...parts);
};

/**
 * Takes an ApiConfig object and array of Query objects and returns a Query API request URL.
 */
export const urlFromQueries = (
  config: ApiConfig,
  queries: Query | Query[],
  options?: RequestOptions,
  requestType: RequestType = 'results',
): string => {
  if (!(queries instanceof Array)) {
    queries = [queries];
  }
  if (!config.baseUrl) {
    throw new Error('Base URL missing');
  }
  if (!config.version) {
    throw new Error('Version missing');
  }
  if (!config.workspace) {
    throw new Error('Workspace missing');
  }
  if (!config.api) {
    throw new Error('API name missing');
  }

  // Construct base URL containing Spinque version and workspace
  let url = join(config.baseUrl, config.version, config.workspace, 'api', config.api);

  // Add the path represented by the Query objects and request type
  url = join(url, pathFromQueries(queries), requestType);

  // Add config if provided
  if (config.config) {
    url += `?config=${config.config}`;
  }

  if (options && Object.keys(options).length > 0) {
    Object.entries(options).forEach(([option, value], index) => {
      if (index === 0 && !config.config) {
        url += '?';
      } else {
        url += '&';
      }
      url += `${option}=${value}`;
    });
  }

  return url;
};

export const tupleListToString = (
  tuples: (string | number)[][] | (string | number)[] | string | number,
  scores?: number[],
): string => {
  const _tuples = ensureTupleList(tuples);
  if (scores && scores.length !== _tuples.length) {
    throw new Error('Scores does not contain as many items as tuples');
  }
  const _scores = scores || Array.from(Array(_tuples.length)).map(() => 1);

  return _tuples
    .map((tuple, index) => {
      const s = _scores[index];
      const values = tuple.join(',');
      return `${s}(${values})`;
    })
    .join('|');
};

const ensureTupleList = (
  value: (string | number)[][] | (string | number)[] | (string | number),
): (string | number)[][] => {
  // Convert string or number to nested array
  if (typeof value === 'string' || typeof value === 'number') {
    return [[value]];
  }

  if (!(value instanceof Array)) {
    throw new Error('Tuple list should be of type: (string|number)[][] | (string|number)[] | (string|number)');
  }

  if (value.length === 0) {
    return [[]];
  }

  let someAreArrays = false;
  let allAreArrays = true;
  for (const t of value) {
    if (t instanceof Array) {
      someAreArrays = true;
      if (value[0] instanceof Array && t.length !== value[0].length) {
        throw new Error('Tuple list has unequally sized rows (some have more columns)');
      }
    } else {
      allAreArrays = false;
    }
  }

  if (someAreArrays && !allAreArrays) {
    throw new Error('Tuple list has unequally sized rows (some are a single value, some arrays)');
  }

  if (!someAreArrays) {
    return (value as (string | number)[]).map((v) => [v]);
  }

  return value as (string | number)[][];
};
