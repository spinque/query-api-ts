import { FacetFilter, FacetType, Filter, ParameterizedFilter, Query, SimpleFilter } from './types';
import { isTupleList, stringifyQueries, stringToTupleList, tupleListToString } from './utils';

export type FilterSelection = undefined | null | string | number | (string | number)[] | (string | number)[][];

export interface FilteredSearchState {
  readonly searchQuery: Query;
  readonly emptyParameterQuery?: Query;
  readonly filters: readonly Filter[];
  readonly modifiers?: readonly Query[];
  readonly activeModifier?: Query;
}

export interface FilteredSearchConfig {
  readonly searchQuery: Query;
  readonly emptyParameterQuery?: Query;
  readonly filters?: readonly Filter[];
  readonly modifiers?: readonly Query[];
  readonly activeModifier?: Query;
}

export interface FacetOptions {
  readonly type?: FacetType;
  readonly resetOnQueryChange?: boolean;
  readonly filterEndpointPostfix?: string;
  readonly filterParameterName?: string;
  readonly filterParameterValue?: string | number;
}

export interface ParameterizedFilterOptions {
  readonly resetOnQueryChange?: boolean;
  readonly filterParameterName?: string;
  readonly filterParameterValue?: string | number;
}

const hasParameterValueSet = (filter: ParameterizedFilter | FacetFilter) =>
  filter.filterParameterValue !== undefined && filter.filterParameterValue !== '';

const cloneQuery = (query: Query): Query => ({
  ...query,
  parameters: query.parameters ? { ...query.parameters } : undefined,
});

const cloneFilter = (filter: Filter): Filter => ({ ...filter });

const cloneState = (state: FilteredSearchState): FilteredSearchState => ({
  searchQuery: cloneQuery(state.searchQuery),
  emptyParameterQuery: state.emptyParameterQuery ? cloneQuery(state.emptyParameterQuery) : undefined,
  filters: state.filters.map(cloneFilter),
  modifiers: state.modifiers?.map(cloneQuery),
  activeModifier: state.activeModifier ? cloneQuery(state.activeModifier) : undefined,
});

const assertValidSearchQuery = (searchQuery: Query) => {
  if (!searchQuery.parameters || Object.keys(searchQuery.parameters).length === 0) {
    throw new Error('searchQuery has no parameters. Please initialize with an empty parameter');
  }
};

const findFilter = (filters: readonly Filter[], endpoint: string): Filter | undefined =>
  filters.find(
    (filter) =>
      filter.filterEndpoint === endpoint || ('optionsEndpoint' in filter && filter.optionsEndpoint === endpoint),
  );

const identifyFilter = (filter: Filter): string =>
  'optionsEndpoint' in filter ? filter.optionsEndpoint : filter.filterEndpoint;

const queryFromFilter = (filter: Filter): Query => ({
  endpoint: filter.filterEndpoint,
  parameters: !('filterParameterName' in filter)
    ? {}
    : { [filter.filterParameterName]: filter.filterParameterValue as string },
});

const isEmptySelection = (selection: FilterSelection): boolean =>
  (Array.isArray(selection) && selection.length === 0) ||
  selection === '' ||
  selection === undefined ||
  selection === null;

const normalizeFilterSelection = (
  filter: ParameterizedFilter | FacetFilter,
  endpoint: string,
  selection: FilterSelection,
) => {
  if (isEmptySelection(selection)) {
    return undefined;
  }

  if ('optionsEndpoint' in filter) {
    const values = (Array.isArray(selection) ? selection : [selection]) as (string | number)[] | (string | number)[][];

    if (filter.type === FacetType.single) {
      if (values.length > 1) {
        throw new Error(`Facet ${endpoint} is a single selection facet but more than one selected option was given.`);
      }
      return Array.isArray(values[0]) ? values[0][0] : values[0];
    }

    return tupleListToString(values);
  }

  return Array.isArray(selection) ? tupleListToString(selection) : selection;
};

export const facet = (endpoint: string, options: FacetOptions = {}): FacetFilter => ({
  optionsEndpoint: endpoint,
  filterEndpoint: `${endpoint}${options.filterEndpointPostfix ?? ':FILTER'}`,
  filterParameterName: options.filterParameterName ?? 'value',
  filterParameterValue: options.filterParameterValue,
  resetOnQueryChange: options.resetOnQueryChange ?? true,
  type: options.type ?? FacetType.single,
});

export const simpleFilter = (filterEndpoint: string): SimpleFilter => ({ filterEndpoint });

export const parameterizedFilter = (
  filterEndpoint: string,
  options: ParameterizedFilterOptions = {},
): ParameterizedFilter => ({
  filterEndpoint,
  filterParameterName: options.filterParameterName ?? 'value',
  filterParameterValue: options.filterParameterValue,
  resetOnQueryChange: options.resetOnQueryChange ?? true,
});

const stateFromConfig = (config: FilteredSearchConfig): FilteredSearchState => {
  const searchQuery = cloneQuery(config.searchQuery);
  assertValidSearchQuery(searchQuery);

  return {
    searchQuery,
    emptyParameterQuery: config.emptyParameterQuery ? cloneQuery(config.emptyParameterQuery) : undefined,
    filters: config.filters?.map(cloneFilter) ?? [],
    modifiers: config.modifiers?.map(cloneQuery),
    activeModifier: config.activeModifier ? cloneQuery(config.activeModifier) : undefined,
  };
};

/**
 * Create immutable state for a filtered search setup.
 *
 * The returned object is plain data so framework adapters can store it in
 * React state, Angular services, Solid stores/signals, or any other reactive
 * layer without depending on this library for reactivity.
 */
export function createFilteredSearchState(config: FilteredSearchConfig): FilteredSearchState;
export function createFilteredSearchState(
  searchQuery: Query,
  emptyParameterQuery?: Query,
  modifiers?: Query[],
): FilteredSearchState;
export function createFilteredSearchState(
  configOrSearchQuery: FilteredSearchConfig | Query,
  emptyParameterQuery?: Query,
  modifiers?: Query[],
): FilteredSearchState {
  if ('searchQuery' in configOrSearchQuery) {
    return stateFromConfig(configOrSearchQuery);
  }

  return stateFromConfig({
    searchQuery: configOrSearchQuery,
    emptyParameterQuery,
    modifiers,
  });
}

export const getFilteredSearchFilters = (state: FilteredSearchState): Filter[] => state.filters.map(cloneFilter);

export const withFacet = (
  state: FilteredSearchState,
  endpoint: string,
  type: FacetType = FacetType.single,
  resetOnQueryChange = true,
  filterEndpointPostfix = ':FILTER',
  filterEndpointParameterName = 'value',
): FilteredSearchState => ({
  ...cloneState(state),
  filters: [
    ...state.filters.map(cloneFilter),
    facet(endpoint, {
      type,
      resetOnQueryChange,
      filterEndpointPostfix,
      filterParameterName: filterEndpointParameterName,
    }),
  ],
});

export const withSimpleFilter = (state: FilteredSearchState, filterEndpoint: string): FilteredSearchState => ({
  ...cloneState(state),
  filters: [...state.filters.map(cloneFilter), simpleFilter(filterEndpoint)],
});

export const withParameterizedFilter = (
  state: FilteredSearchState,
  filterEndpoint: string,
  resetOnQueryChange = true,
  filterParameterName = 'value',
): FilteredSearchState => ({
  ...cloneState(state),
  filters: [
    ...state.filters.map(cloneFilter),
    parameterizedFilter(filterEndpoint, { filterParameterName, resetOnQueryChange }),
  ],
});

export const withFilter = (state: FilteredSearchState, obj: Query | Filter): FilteredSearchState => {
  if ('endpoint' in obj) {
    const params = Object.entries(obj.parameters || {});

    if (params.length === 0) {
      const filter: SimpleFilter = { filterEndpoint: obj.endpoint };
      return { ...cloneState(state), filters: [...state.filters.map(cloneFilter), filter] };
    }

    if (params[0][1] !== undefined && params[0][1] !== '') {
      const [filterParameterName, filterParameterValue] = params[0];
      const filter: ParameterizedFilter = {
        filterEndpoint: obj.endpoint,
        filterParameterName,
        filterParameterValue,
        resetOnQueryChange: true,
      };
      return { ...cloneState(state), filters: [...state.filters.map(cloneFilter), filter] };
    }

    throw new Error(`Provided Query should have a single parameter will a truthy value`);
  }

  if ('filterEndpoint' in obj) {
    return { ...cloneState(state), filters: [...state.filters.map(cloneFilter), cloneFilter(obj)] };
  }

  throw new Error(`Provided object does not seem to be a filter or query`);
};

export const withModifier = (state: FilteredSearchState, modifier: Query | undefined): FilteredSearchState => {
  if (modifier === undefined) {
    return { ...cloneState(state), activeModifier: undefined };
  }

  if (state.modifiers && !state.modifiers.find((allowedModifier) => allowedModifier.endpoint === modifier.endpoint)) {
    return cloneState(state);
  }

  return { ...cloneState(state), activeModifier: cloneQuery(modifier) };
};

export const getFilteredSearchModifier = (state: FilteredSearchState): Query | undefined =>
  state.activeModifier ? cloneQuery(state.activeModifier) : undefined;

export const getFilteredSearchBaseQuery = (state: FilteredSearchState): Query => {
  const parameters = state.searchQuery.parameters;
  const hasEmptyParameters =
    !parameters ||
    Object.keys(parameters).length === 0 ||
    Object.values(parameters).every((value) => !value || value === '');

  return cloneQuery(state.emptyParameterQuery && hasEmptyParameters ? state.emptyParameterQuery : state.searchQuery);
};

export const getFilteredSearchResultsQuery = (state: FilteredSearchState, excludeModifier = false): Query[] => {
  const queries = [
    getFilteredSearchBaseQuery(state),
    ...state.filters
      .filter((filter) => !('filterParameterName' in filter) || hasParameterValueSet(filter))
      .map(queryFromFilter),
  ];

  if (!excludeModifier && state.activeModifier !== undefined && state.activeModifier !== null) {
    queries.push(cloneQuery(state.activeModifier));
  }

  return queries;
};

export const getFilteredSearchFacetQuery = (
  state: FilteredSearchState,
  facetEndpoint: string,
  excludeModifier = false,
  includeSelf = false,
): Query[] => {
  const facet = state.filters.find(
    (filter): filter is FacetFilter => 'optionsEndpoint' in filter && filter.optionsEndpoint === facetEndpoint,
  );

  if (!facet) {
    throw new Error('Facet not found in FilteredSearch');
  }

  const queries = [
    getFilteredSearchBaseQuery(state),
    ...state.filters
      .filter(
        (filter) =>
          !('filterParameterName' in filter) ||
          (!('optionsEndpoint' in filter) && hasParameterValueSet(filter)) ||
          ('optionsEndpoint' in filter &&
            (includeSelf || filter.optionsEndpoint !== facetEndpoint) &&
            hasParameterValueSet(filter)),
      )
      .map(queryFromFilter),
  ];

  if (!excludeModifier && state.activeModifier !== undefined && state.activeModifier !== null) {
    queries.push(cloneQuery(state.activeModifier));
  }

  queries.push({ endpoint: facet.optionsEndpoint });
  return queries;
};

export const withParameter = (state: FilteredSearchState, name: string, value: string): FilteredSearchState => ({
  ...cloneState(state),
  searchQuery: {
    ...cloneQuery(state.searchQuery),
    parameters: {
      ...state.searchQuery.parameters,
      [name]: value,
    },
  },
  filters: state.filters.map((filter) =>
    'filterParameterName' in filter && filter.resetOnQueryChange
      ? { ...filter, filterParameterValue: undefined }
      : cloneFilter(filter),
  ),
});

export const withClearedParameters = (state: FilteredSearchState): FilteredSearchState => ({
  ...cloneState(state),
  searchQuery: {
    ...cloneQuery(state.searchQuery),
    parameters: Object.keys(state.searchQuery.parameters || {}).reduce<{ [name: string]: string }>(
      (acc, key) => ({ ...acc, [key]: '' }),
      {},
    ),
  },
});

export const withFilterSelection = (
  state: FilteredSearchState,
  endpoint: string,
  selection: FilterSelection,
): FilteredSearchState => {
  const filter = findFilter(state.filters, endpoint);

  if (!filter) {
    throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
  }

  if (!('filterParameterName' in filter)) {
    throw new Error(`Filter ${endpoint} does not have a parameter (so it cannot be set)`);
  }

  const filterParameterValue = normalizeFilterSelection(filter, endpoint, selection);

  return {
    ...cloneState(state),
    filters: state.filters.map((currentFilter) =>
      currentFilter === filter ? { ...filter, filterParameterValue } : cloneFilter(currentFilter),
    ),
  };
};

const findParameterizedFilter = (state: FilteredSearchState, endpoint: string): ParameterizedFilter | FacetFilter => {
  const filter = findFilter(state.filters, endpoint);

  if (!filter) {
    throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
  }

  if (!('filterParameterName' in filter)) {
    throw new Error(`Filter ${endpoint} does not have a parameter (so it has no selection)`);
  }

  return filter;
};

/**
 * The read side of {@link withFilterSelection}: the current selection of a filter as a list of tuples.
 *
 * @param state - The filtered search state.
 * @param endpoint - The endpoint of the filter or facet (for facets, the options endpoint).
 * @returns The selected tuples, or `[]` when nothing is selected.
 * @throws If the state has no such filter, or the filter has no parameter.
 */
export const getFilterSelectionTuples = (state: FilteredSearchState, endpoint: string): (string | number)[][] => {
  const filter = findParameterizedFilter(state, endpoint);
  const value = filter.filterParameterValue;

  if (value === undefined || value === '') {
    return [];
  }

  const isFacet = 'optionsEndpoint' in filter;
  if (isFacet && filter.type === FacetType.single) {
    return [[value]];
  }

  const stringValue = String(value);
  // Facets always store a tuple list when multiple; for other filters it is only one if it looks like one.
  const selection = isFacet || isTupleList(stringValue) ? stringToTupleList(stringValue) : null;
  return selection ? selection.tuples : [[value]];
};

/**
 * The read side of {@link withFilterSelection}: the current selection of a filter as scalar values.
 *
 * @param state - The filtered search state.
 * @param endpoint - The endpoint of the filter or facet (for facets, the options endpoint).
 * @returns The selected values, or `[]` when nothing is selected.
 * @throws If the state has no such filter, the filter has no parameter, or the selection contains tuples of more than
 * one value (use {@link getFilterSelectionTuples} for those).
 */
export const getFilterSelection = (state: FilteredSearchState, endpoint: string): (string | number)[] =>
  getFilterSelectionTuples(state, endpoint).map((tuple) => {
    if (tuple.length !== 1) {
      throw new Error(`Filter ${endpoint} has tuple selections; use getFilterSelectionTuples instead`);
    }
    return tuple[0];
  });

export const withClearedFilterSelection = (state: FilteredSearchState, endpoint?: string): FilteredSearchState => {
  if (endpoint) {
    const filter = findFilter(state.filters, endpoint);

    if (!filter) {
      throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
    }

    if (!('filterParameterName' in filter)) {
      throw new Error(`Filter ${endpoint} does not have a parameter (so it cannot be reset)`);
    }

    return withFilterSelection(state, endpoint, '');
  }

  return {
    ...cloneState(state),
    filters: state.filters.map((filter) =>
      'filterParameterName' in filter ? { ...filter, filterParameterValue: '' } : cloneFilter(filter),
    ),
  };
};

export const withSearchQuery = (state: FilteredSearchState, query: Query): FilteredSearchState => ({
  ...cloneState(state),
  searchQuery: cloneQuery(query),
});

/**
 * Apply a Query stack (as produced by `getResultsQuery`) to the state: the inverse of `getResultsQuery`.
 *
 * Only the search query, the active modifier and the selections of already configured filters are set; the filter
 * structure itself is kept, and queries for unknown filters are ignored. Filters that do not occur in the stack are
 * cleared. An empty stack resets the parameters and all selections.
 *
 * @param queries typically retrieved from a URL query parameter and then parsed with `parseQueries`
 */
export const withQueryStack = (state: FilteredSearchState, queries: Query[]): FilteredSearchState => {
  if (!queries || queries.length === 0) {
    return withClearedFilterSelection(
      Object.entries(state.searchQuery.parameters || {}).reduce(
        (nextState, [name, value]) => withParameter(nextState, name, value),
        state,
      ),
    );
  }

  if (stringifyQueries(queries) === stringifyQueries(getFilteredSearchResultsQuery(state))) {
    return cloneState(state);
  }

  let nextState = cloneState(state);
  const filtersTouched: string[] = [];

  queries.forEach((query, index) => {
    if (index === 0) {
      nextState = withSearchQuery(nextState, query);
      return;
    }

    if (index === queries.length - 1 && nextState.modifiers?.find((modifier) => modifier.endpoint === query.endpoint)) {
      nextState = withModifier(nextState, query);
      return;
    }

    const filter = nextState.filters.find((currentFilter) => currentFilter.filterEndpoint === query.endpoint);
    if (!filter || !('filterParameterName' in filter)) {
      return;
    }

    const endpoint = identifyFilter(filter);
    const selection = query.parameters?.[filter.filterParameterName];

    if (selection && isTupleList(selection)) {
      nextState = withFilterSelection(nextState, endpoint, stringToTupleList(selection)?.tuples);
    } else {
      nextState = withFilterSelection(nextState, endpoint, selection);
    }

    filtersTouched.push(endpoint);
  });

  nextState.filters.forEach((filter) => {
    const endpoint = identifyFilter(filter);
    if ('filterParameterName' in filter && !filtersTouched.includes(endpoint)) {
      nextState = withFilterSelection(nextState, endpoint, []);
    }
  });

  return nextState;
};

export const getFilters = getFilteredSearchFilters;
export const getModifier = getFilteredSearchModifier;
export const getBaseQuery = getFilteredSearchBaseQuery;
export const getResultsQuery = getFilteredSearchResultsQuery;
export const getFacetQuery = getFilteredSearchFacetQuery;

/**
 * Associate {@link Query} objects with each other in a filtered search setup,
 * using {@link Filter} definitions.
 *
 * This class is a backwards-compatible wrapper around the plain state helpers.
 * New framework-specific integrations should prefer storing
 * {@link FilteredSearchState} directly and updating it with the `with*`
 * functions exported from this module.
 */
export class FilteredSearch {
  protected _state: FilteredSearchState;

  constructor(searchQuery: Query, emptyParameterQuery?: Query, modifiers?: Query[]) {
    this._state = createFilteredSearchState(searchQuery, emptyParameterQuery, modifiers);
  }

  protected get _filters(): Filter[] {
    return getFilteredSearchFilters(this._state);
  }

  get state(): FilteredSearchState {
    return cloneState(this._state);
  }

  addFacet(
    endpoint: string,
    type: FacetType = FacetType.single,
    resetOnQueryChange = true,
    filterEndpointPostfix = ':FILTER',
    filterEndpointParameterName = 'value',
  ) {
    this._state = withFacet(
      this._state,
      endpoint,
      type,
      resetOnQueryChange,
      filterEndpointPostfix,
      filterEndpointParameterName,
    );
  }

  addSimpleFilter(filterEndpoint: string) {
    this._state = withSimpleFilter(this._state, filterEndpoint);
  }

  addParameterizedFilter(filterEndpoint: string, resetOnQueryChange = true, filterParameterName = 'value') {
    this._state = withParameterizedFilter(this._state, filterEndpoint, resetOnQueryChange, filterParameterName);
  }

  addFilter(obj: Query | Filter): void {
    this._state = withFilter(this._state, obj);
  }

  get filters(): Filter[] {
    return getFilteredSearchFilters(this._state);
  }

  setModifier(modifier: Query | undefined) {
    this._state = withModifier(this._state, modifier);
  }

  getModifier(): Query | undefined {
    return getFilteredSearchModifier(this._state);
  }

  getBaseQuery(): Query {
    return getFilteredSearchBaseQuery(this._state);
  }

  getResultsQuery(excludeModifier = false): Query[] {
    return getFilteredSearchResultsQuery(this._state, excludeModifier);
  }

  getFacetQuery(facetEndpoint: string, excludeModifier = false, includeSelf = false): Query[] {
    return getFilteredSearchFacetQuery(this._state, facetEndpoint, excludeModifier, includeSelf);
  }

  public setParameter(name: string, value: string) {
    this._state = withParameter(this._state, name, value);
  }

  public clearParameters() {
    this._state = withClearedParameters(this._state);
  }

  public setFilterSelection(endpoint: string, selection: FilterSelection) {
    this._state = withFilterSelection(this._state, endpoint, selection);
  }

  public getFilterSelection(endpoint: string): (string | number)[] {
    return getFilterSelection(this._state, endpoint);
  }

  public clearFilterSelection(endpoint?: string) {
    this._state = withClearedFilterSelection(this._state, endpoint);
  }

  public setSearchQuery(query: Query) {
    this._state = withSearchQuery(this._state, query);
  }

  public setQueryStack(queries: Query[]) {
    this._state = withQueryStack(this._state, queries);
  }
}
