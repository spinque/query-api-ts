import { ApiConfig, Query } from '.';
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
      parts.push('p', encodeURIComponent(name), encodeURIComponent(value));
    });
  }
  return join(...parts);
};

/**
 * Takes an ApiConfig object and returns the URL to fetch API details
 */
export const apiUrl = (config: ApiConfig): string => {
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

  let url = config.baseUrl;

  if (!url.endsWith('/')) {
    url += '/';
  }

  // Construct base URL containing Spinque version and workspace
  url += join(config.version, config.workspace, 'api', config.api);

  // For loadbalancer reasons, the API URL should end with a slash
  if (!url.endsWith('/')) {
    url += '/';
  }

  // Add config if provided
  if (config.config) {
    url += `?config=${config.config}`;
  }

  return url;
};

/**
 * Takes an ApiConfig object and returns the URL to fetch API status
 */
export const apiStatusUrl = (config: ApiConfig): string => {
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

  let url = config.baseUrl;

  if (!url.endsWith('/')) {
    url += '/';
  }

  // Construct base URL containing Spinque version and workspace
  url += join(config.version, config.workspace, 'api', config.api, 'status');

  // Add config if provided
  if (config.config) {
    url += `?config=${config.config}`;
  }

  return url;
};

/**
 * Takes an ApiConfig object and array of Query objects and returns a Query API request URL.
 */
export const urlFromQueries = (
  config: ApiConfig,
  queries: Query | Query[],
  options?: RequestOptions,
  requestType: RequestType = RequestType.Results,
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

  let url = config.baseUrl;

  if (!url.endsWith('/')) {
    url += '/';
  }

  // Construct base URL containing Spinque version and workspace
  url += join(config.version, config.workspace, 'api', config.api);

  // Add the path represented by the Query objects and request type
  url += '/' + join(pathFromQueries(queries), requestType);

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

/**
 * Given a tuple list (and optionally scores), return a string representation.
 */
export const stringToTupleList = (value: string): { scores: number[]; tuples: (string | number)[][] } | null => {
  try {
    return value.split('|').reduce(
      (acc, cur) => {
        const score = parseFloat(cur.split('(')[0]);
        const tuples = cur.split('(')[1].split(')')[0].split(',');
        acc.scores.push(score);
        acc.tuples.push(tuples);
        return acc;
      },
      { scores: [], tuples: [] } as { scores: number[]; tuples: (string | number)[][] },
    );
  } catch (error) {
    return null;
  }
};

/**
 * Given a string, try to parse as tuple list.
 */
export const tupleListToString = (
  // tuples can be either a string, a number, an array of strings or numbers,
  // or an array of arrays of strings or numbers
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

export const isTupleList = (value: string) => /\d(\.\d+)?\(.*\)/.test(value);

/**
 * Takes a value that should be a tuple list and ensures it has a normalized form.
 */
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

/**
 * Joins together URL parts into an URL
 */
export const join = (...segments: string[]): string => {
  const parts = segments.reduce((_parts: string[], segment) => {
    // Remove leading slashes from non-first part.
    if (_parts.length > 0) {
      segment = segment.replace(/^\//, '');
    }
    // Remove trailing slashes.
    segment = segment.replace(/\/$/, '');
    return _parts.concat(segment.split('/'));
  }, [] as string[]);
  const resultParts: string[] = [];
  for (const part of parts) {
    if (part === '.') {
      continue;
    }
    if (part === '..') {
      resultParts.pop();
      continue;
    }
    resultParts.push(part);
  }
  return resultParts.join('/');
};

/**
 * Expects a string generated by stringifyQueries and returns an array of Query's
 */
export const parseQueries = (stringified: string): Query[] => {
  if (!stringified) {
    return [];
  }
  try {
    const endpoints = JSON.parse(stringified) as ([Query['endpoint'], Query['parameters']] | string)[];
    return endpoints.map((e) => {
      if (typeof e === 'string') {
        return {
          endpoint: e,
          parameters: undefined,
        };
      } else {
        return {
          endpoint: e[0],
          parameters: e[1],
        };
      }
    }) as Query[];
  } catch (error) {
    return [];
  }
};

/**
 * Expects an array of Query's and turns them into a string
 */
export const stringifyQueries = (queries: Query[]): string => {
  const endpointString = queries.map((q) => (q.parameters ? [q.endpoint, q.parameters] : q.endpoint));
  return JSON.stringify(endpointString);
};

export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
