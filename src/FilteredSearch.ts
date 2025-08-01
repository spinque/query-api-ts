import { FacetFilter, FacetType, Filter, Query } from './types';
import { tupleListToString } from './utils';

const isFacetFilter = (filter: Filter): filter is FacetFilter => 'optionsEndpoint' in filter;

/**
 * Associate Query objects with each other in a faceted search setup.
 */
export class FilteredSearch {
  // Internal list of Facet objects
  private _filters: Filter[] = [];

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

  addSimpleFilter(filterEndpoint: string, resetOnQueryChange = true, filterParameterName = 'value') {
    this._filters.push({ filterEndpoint, filterParameterName, resetOnQueryChange, filterParameterValue: undefined });
  }

  /**
   * Add a filter to the FilteredSearch object.
   */
  addFilter(filter: Filter) {
    this._filters.push(filter);
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
        .filter((f) => f.filterParameterValue !== undefined && f.filterParameterValue !== '')
        .map((f) => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string },
        })),
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
    const facet = this._filters.find((f): f is FacetFilter => isFacetFilter(f) && f.optionsEndpoint === facetEndpoint);
    if (!facet) {
      throw new Error('Facet not found in FilteredSearch');
    }

    const q = [
      this.getBaseQuery(),
      ...this._filters
        .filter(
          (f) =>
            f.filterParameterValue !== undefined &&
            f.filterParameterValue !== '' &&
            (!isFacetFilter(f) || f.optionsEndpoint !== facetEndpoint),
        )
        .map((f) => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string },
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
      if (f.resetOnQueryChange) {
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
   * Set the selected options for a given facet.
   */
  public setFilterSelection(endpoint: string, selection: string | string[]) {
    // Find the filter
    const filter = this._filters.find(
      (f) => f.filterEndpoint === endpoint || (isFacetFilter(f) && f.optionsEndpoint === endpoint),
    );
    if (!filter) {
      throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
    }

    // Clear the value if an empty string or empty array was passed
    if ((Array.isArray(selection) && selection.length === 0) || selection === '') {
      filter.filterParameterValue = undefined;
      return;
    }

    if (isFacetFilter(filter)) {
      // make sure the selection is an array
      selection = Array.isArray(selection) ? selection : [selection];

      if (filter.type === 'single') {
        if (selection.length > 1) {
          throw new Error(`Facet ${endpoint} is a single selection facet but more than one selected option was given.`);
        }
        filter.filterParameterValue = selection[0];
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
      const facet = this._filters.find(
        (f) => f.filterEndpoint === endpoint || (isFacetFilter(f) && f.optionsEndpoint === endpoint),
      );
      if (!facet) {
        throw new Error(`FilteredSearch does not contain filter ${endpoint}`);
      }
      facet.filterParameterValue = '';
    } else {
      this._filters.forEach((f) => {
        f.filterParameterValue = '';
      });
    }
  }

  public setSearchQuery(query: Query) {
    this.searchQuery = query;
  }
}
