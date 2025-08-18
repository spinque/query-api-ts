import { FacetFilter, FacetType, Filter, ParameterizedFilter, Query, SimpleFilter } from './types';
import { isTupleList, stringifyQueries, stringToTupleList, tupleListToString } from './utils';

const hasParameterValueSet = (f: ParameterizedFilter | FacetFilter) =>
  f.filterParameterValue !== undefined && f.filterParameterValue !== '';

/**
 * Associate Query objects with each other in a filtered search setup.
 *
 * Instances of this class respresent search pages with filters and/or modifiers (such as sorting).
 */
export class FilteredSearch {
  // Internal list of Filter objects
  protected _filters: Filter[] = [];

  private _modifiers?: Query[];
  private _activeModifier?: Query;

  constructor(
    // Query object for the search results that will serve as the base for this facet.
    // The searchQuery is used to fetch the options of the facet and will be filtered once
    // one or more facet options are selected.
    // The searchQuery must have at least one parameter.
    private searchQuery: Query,
    // emptyParameterQuery is used instead of searchQuery when the searchQuery parameters are all empty.
    // If no emptyParameterQuery is passed, searchQuery is fetched with empty parameters.
    private emptyParameterQuery?: Query,
    private modifiers?: Query[],
  ) {
    // Throw an error if the searchQuery does not have parameters
    if (!searchQuery.parameters || Object.keys(searchQuery.parameters).length === 0) {
      throw new Error('searchQuery has no parameters. Please initialize with an empty parameter');
    }
    if (modifiers) {
      this._modifiers = modifiers;
    }
  }

  /**
   * Add a facet to the FilteredSearch object.
   */
  addFacet(
    endpoint: string,
    type: FacetType = FacetType.single,
    resetOnQueryChange = true,
    filterEndpointPostfix = ':FILTER',
    filterEndpointParameterName = 'value',
  ) {
    this._filters.push({
      optionsEndpoint: endpoint,
      filterEndpoint: `${endpoint}${filterEndpointPostfix}`,
      filterParameterName: filterEndpointParameterName,
      filterParameterValue: undefined,
      resetOnQueryChange,
      type,
    });
  }

  addSimpleFilter(filterEndpoint: string) {
    this._filters.push({ filterEndpoint });
  }

  addParameterizedFilter(filterEndpoint: string, resetOnQueryChange = true, filterParameterName = 'value') {
    this._filters.push({ filterEndpoint, filterParameterName, resetOnQueryChange, filterParameterValue: undefined });
  }

  /**
   * Add a filter to the FilteredSearch object.
   *
   * @param obj the Filter to be added or a Query object, from which a
   * SimpleFilter or ParameterizedFilter will be deduced
   */
  addFilter(obj: Query | Filter): void {
    if ('endpoint' in obj) {
      // Query.endpoint becomes Filter.filterEndpoint
      const filterEndpoint = obj.endpoint;

      const params = Object.entries(obj.parameters || {});
      if (params.length === 0) {
        // No parameters so push as a SimpleFilter
        const filter: SimpleFilter = { filterEndpoint };
        this._filters.push(filter);
      } else if (params[0][1] !== undefined && params[0][1] !== '') {
        const [filterParameterName, filterParameterValue] = params[0];

        // Push as a ParameterizedFilter
        const filter: ParameterizedFilter = {
          filterEndpoint,
          filterParameterName,
          filterParameterValue,
          resetOnQueryChange: true,
        };
        this._filters.push(filter);
      } else {
        console.log(params[0]);
        throw new Error(`Provided Query should have a single parameter will a truthy value`);
      }
    } else if ('filterEndpoint' in obj) {
      this._filters.push(obj);
    } else {
      throw new Error(`Provided object does not seem to be a filter or query`);
    }
  }

  get filters(): Filter[] {
    return this._filters;
  }

  /**
   * Set a query as modifier. Only modifiers in the list passed to constructor are allowed.
   */
  setModifier(modifier: Query | undefined) {
    if (modifier === undefined) {
      this._activeModifier = undefined;
    } else if (this._modifiers) {
      const allowed = this._modifiers.find((m) => m.endpoint === modifier?.endpoint);
      if (!allowed) {
        return;
      }
      this._activeModifier = modifier;
    }
  }

  /**
   * Get the currently active modifier query.
   */
  getModifier(): Query | undefined {
    return this._activeModifier;
  }

  /**
   * Get the Query to get the search results.
   * Will return searchQuery as passed to the constructor unless a emptyParameterQuery was
   * also passed and all parameters for searchQuery are empty.
   */
  getBaseQuery(): Query {
    if (
      this.emptyParameterQuery &&
      (!this.searchQuery.parameters ||
        Object.keys(this.searchQuery.parameters).length === 0 ||
        Object.values(this.searchQuery.parameters).every((p) => !p || p === ''))
    ) {
      return this.emptyParameterQuery;
    } else {
      return this.searchQuery;
    }
  }

  /**
   * Get the Query objects to retrieve search results. This includes the facet Query, if applicable.
   */
  getResultsQuery(excludeModifier = false): Query[] {
    const q = [
      this.getBaseQuery(),
      ...this._filters
        .filter((f) => !('filterParameterName' in f) || hasParameterValueSet(f))
        .map((f) => {
          const parameters = !('filterParameterName' in f)
            ? {}
            : { [f.filterParameterName]: f.filterParameterValue as string };
          return {
            endpoint: f.filterEndpoint,
            parameters,
          };
        }),
    ];
    if (!excludeModifier && this._activeModifier !== undefined && this._activeModifier !== null) {
      q.push(this._activeModifier);
    }
    return q;
  }

  /**
   * Get the Query objects to retrieve the facet options. When using multiple facets, the facetEndpoint
   * parameter is required.
   */
  getFacetQuery(facetEndpoint: string, excludeModifier = false): Query[] {
    const facet = this._filters.find(
      (f): f is FacetFilter => 'optionsEndpoint' in f && f.optionsEndpoint === facetEndpoint,
    );
    if (!facet) {
      throw new Error('Facet not found in FilteredSearch');
    }

    const q = [
      this.getBaseQuery(),
      ...this._filters
        .filter(
          (f) =>
            // Simple filters are always enabled
            !('filterParameterName' in f) ||
            // Parameterized filters must have a value set
            (!('optionsEndpoint' in f) && hasParameterValueSet(f)) ||
            // Facet filters must have a value set and must not be the facet for which we're building the options query
            ('optionsEndpoint' in f && f.optionsEndpoint !== facetEndpoint && hasParameterValueSet(f)),
        )
        .map((f) => ({
          endpoint: f.filterEndpoint,
          parameters: !('filterParameterName' in f)
            ? {}
            : { [f.filterParameterName]: f.filterParameterValue as string },
        })),
    ];
    if (!excludeModifier && this._activeModifier !== undefined && this._activeModifier !== null) {
      q.push(this._activeModifier);
    }
    q.push({ endpoint: facet.optionsEndpoint });
    return q;
  }

  /**
   * Set a parameter value for the searchQuery
   */
  public setParameter(name: string, value: string) {
    this.searchQuery = {
      ...this.searchQuery,
      parameters: {
        ...this.searchQuery.parameters,
        [name]: value,
      },
    };
    this._filters.forEach((f) => {
      if ('filterParameterName' in f && f.resetOnQueryChange) {
        f.filterParameterValue = undefined;
      }
    });
  }

  /**
   * Clear all searchQuery parameters
   */
  public clearParameters() {
    this.searchQuery = {
      ...this.searchQuery,
      parameters: Object.keys(this.searchQuery.parameters || {}).reduce((acc, cur) => ({ ...acc, [cur]: '' }), {}),
    };
  }

  /**
   * Set the selected options for a given filter or facet.
   */
  public setFilterSelection(
    endpoint: string,
    selection: undefined | null | (string | number) | (string | number)[] | (string | number)[][],
  ) {
    // Find the filter in the list of defined filters
    const filter = this._filters.find(
      (f) => f.filterEndpoint === endpoint || ('optionsEndpoint' in f && f.optionsEndpoint === endpoint),
    );

    if (!filter) {
      throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
    }

    // Filter selections can only be set for parameterized filters
    if (!('filterParameterName' in filter)) {
      throw new Error(`Filter ${endpoint} does not have a parameter (so it cannot be set)`);
    }

    // Clear the value if an empty string or empty array was passed
    if (
      (Array.isArray(selection) && selection.length === 0) ||
      selection === '' ||
      selection === undefined ||
      selection === null
    ) {
      filter.filterParameterValue = undefined;
      return;
    }

    if ('optionsEndpoint' in filter) {
      // make sure the selection is an array
      selection = Array.isArray(selection) ? selection : [selection];

      if (filter.type === 'single') {
        if (selection.length > 1) {
          throw new Error(`Facet ${endpoint} is a single selection facet but more than one selected option was given.`);
        }
        if (Array.isArray(selection[0])) {
          filter.filterParameterValue = selection[0][0];
        } else {
          filter.filterParameterValue = selection[0];
        }
      } else {
        filter.filterParameterValue = tupleListToString(selection);
      }
    } else {
      filter.filterParameterValue = Array.isArray(selection) ? tupleListToString(selection) : selection;
    }
  }

  /**
   * Clear the selection for all or a given filter.
   */
  public clearFilterSelection(endpoint?: string) {
    if (endpoint) {
      const filter = this._filters.find(
        (f) => f.filterEndpoint === endpoint || ('optionsEndpoint' in f && f.optionsEndpoint === endpoint),
      );
      if (!filter) {
        throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
      }
      if (!('filterParameterName' in filter)) {
        throw new Error(`Filter ${endpoint} does not have a parameter (so it cannot be reset)`);
      }
      filter.filterParameterValue = '';
    } else {
      this._filters.forEach((f) => {
        if ('filterParameterName' in f) {
          f.filterParameterValue = '';
        }
      });
    }
  }

  public setSearchQuery(query: Query) {
    this.searchQuery = query;
  }

  /**
   * Overwrite the entire state with the values in the passed Query stack.
   *
   * @param results typically retrieved from a URL query parameter and then parsed with `parseQueries`
   */
  setState(results: Query[]) {
    // If no queries passed, reset the state
    if (!results || results.length === 0) {
      Object.entries(this.searchQuery.parameters || {}).forEach(([k, v]) => this.setParameter(k, v));
      this.clearFilterSelection();
      return;
    }

    // Early return if there's nothing to update
    if (stringifyQueries(results) === stringifyQueries(this.getResultsQuery())) {
      return;
    }

    const filtersTouched: string[] = [];
    results.forEach((query, index) => {
      console.log(`=== INDEX ${index}`);
      console.log(query);
      // The first query on the stack is the main search query
      if (index === 0) {
        this.setSearchQuery(query);
        return;
      }

      // The last query could be the modifier
      if (index === results.length - 1 && this.modifiers?.find((m) => m.endpoint === query.endpoint)) {
        this.setModifier(query);
        return;
      }

      // The middle queries are filters
      const filter = this.filters.find((f) => f.filterEndpoint === query.endpoint);
      if (!filter) {
        return;
      }

      if ('filterParameterName' in filter) {
        // For FacetFilters, the optionsEndpoint is the identifying endpoint
        const endpoint = 'optionsEndpoint' in filter ? filter.optionsEndpoint : filter.filterEndpoint;
        const selection = query.parameters?.[filter.filterParameterName];
        if (selection && isTupleList(selection)) {
          const tupleList = stringToTupleList(selection);
          this.setFilterSelection(endpoint, tupleList?.tuples);
        } else {
          this.setFilterSelection(endpoint, selection);
        }
        filtersTouched.push(endpoint);
      }
    });

    // Reset non-touched endpoints
    this.filters.forEach((filter) => {
      const endpoint = 'optionsEndpoint' in filter ? filter.optionsEndpoint : filter.filterEndpoint;
      if ('filterParameterName' in filter && !filtersTouched.includes(endpoint)) {
        this.setFilterSelection(endpoint, []);
      }
    });
  }
}
