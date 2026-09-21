import { ApiConfig, Query } from '.';
import { OptionsType, RequestType } from './types';

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
  const parts = ['e', encodeURIComponent(query.endpoint).replace('%3AFILTER', ':FILTER')];
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
export const urlFromQueries = <O extends OptionsType<R>, R extends RequestType = RequestType.Results>(
  config: ApiConfig,
  queries: Query | Query[],
  options?: O,
  requestType: R = RequestType.Results as R,
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

  if (requestType === RequestType.Options) {
    // The last endpoint in the query stack should be the facet to fetch options for
    let facet = queries[queries.length - 1].endpoint;
    if (facet.endsWith(':FILTER')) {
      facet = facet.slice(0, -1 * ':FILTER'.length);
    }
    url += '/' + join(...queries.slice(0, -1).map(pathFromQuery), requestType, facet);
  } else {
    url += '/' + join(...queries.map(pathFromQuery), requestType);
  }

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
 * Characters that force a value to be written in quoted form.
 *
 * The Query API tuple list grammar treats `(`, `)` and `,` as structure and uses `"` to quote a value. Inside a
 * quoted value, `\` and `"` are escaped with a backslash.
 */
const NEEDS_QUOTING = /["(),]/;

/**
 * Writes a single tuple value in the Query API tuple list grammar, quoting it when it contains special characters.
 *
 * @throws If the value contains `|`. The grammar splits entries on `|` before it looks at quotes, so there is no
 * representation of a value containing one.
 */
const writeValue = (value: string | number): string => {
  const v = String(value);

  if (v.indexOf('|') !== -1) {
    throw new Error(`Tuple list values cannot contain "|": ${v}`);
  }

  if (v !== '' && !NEEDS_QUOTING.test(v)) {
    return v;
  }

  return `"${v.replace(/([\\"])/g, '\\$1')}"`;
};

/**
 * Reads a single tuple value starting at `index`, returning the value and the index just past it.
 *
 * Returns `null` when a quoted value is not terminated. An unquoted value runs up to the next top level `,`, matching
 * the backend, which does not track parentheses inside a value.
 */
const readValue = (entry: string, index: number): { value: string; next: number } | null => {
  if (entry[index] !== '"') {
    const comma = entry.indexOf(',', index);
    const end = comma === -1 ? entry.length : comma;
    return { value: entry.slice(index, end), next: end };
  }

  let value = '';
  let i = index + 1;

  while (i < entry.length) {
    const char = entry[i];

    if (char === '\\') {
      if (i + 1 >= entry.length) {
        return null;
      }
      value += entry[i + 1];
      i += 2;
      continue;
    }

    if (char === '"') {
      // A doubled quote is an escaped quote, a single one closes the value.
      if (entry[i + 1] === '"') {
        value += '"';
        i += 2;
        continue;
      }
      return { value, next: i + 1 };
    }

    value += char;
    i += 1;
  }

  return null;
};

/**
 * Parses one `score(value,...)` entry. Returns `null` when the entry is malformed.
 */
const readEntry = (entry: string): { score: number; tuple: string[] } | null => {
  const open = entry.indexOf('(');

  if (open === -1 || !entry.endsWith(')') || entry.length < open + 2) {
    return null;
  }

  const score = entry.slice(0, open);
  if (!/^\d+(\.\d+)?$/.test(score)) {
    return null;
  }

  const inner = entry.slice(open + 1, -1);
  const tuple: string[] = [];
  let index = 0;

  for (;;) {
    const read = readValue(inner, index);
    if (!read) {
      return null;
    }
    tuple.push(read.value);
    index = read.next;

    if (index === inner.length) {
      return { score: parseFloat(score), tuple };
    }

    // Anything other than a separator after a value is trailing garbage.
    if (inner[index] !== ',') {
      return null;
    }
    index += 1;
  }
};

/**
 * Given a string, try to parse it as a tuple list. Returns `null` when the string is not a well formed tuple list.
 */
export const stringToTupleList = (value: string): { scores: number[]; tuples: (string | number)[][] } | null => {
  if (!value) {
    return null;
  }

  const scores: number[] = [];
  const tuples: (string | number)[][] = [];

  // Entries are separated by `|`, which the grammar never allows inside a value.
  for (const entry of value.split('|')) {
    const read = readEntry(entry);
    if (!read) {
      return null;
    }
    scores.push(read.score);
    tuples.push(read.tuple);
  }

  return { scores, tuples };
};

/**
 * Given a tuple list (and optionally scores), return a string representation.
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
      const values = tuple.map(writeValue).join(',');
      return `${s}(${values})`;
    })
    .join('|');
};

/**
 * Checks whether a string value is valid tuple list notation.
 */
export const isTupleList = (value: string) => /^\d+(\.\d+)?\(/.test(value) && stringToTupleList(value) !== null;

/**
 * Takes a value that should be a tuple list and ensures it has a normalized form.
 */
function ensureTupleList(value: (string | number)[][]): (string | number)[][];
function ensureTupleList(value: (string | number)[]): (string | number)[][];
function ensureTupleList(value: string | number): (string | number)[][];
function ensureTupleList(value: (string | number)[][] | (string | number)[] | string | number): (string | number)[][];
function ensureTupleList(
  value: (string | number)[][] | (string | number)[] | (string | number),
): (string | number)[][] {
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
}

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
