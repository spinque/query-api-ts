import { Query } from './types';
import { tupleListToString } from './utils';

/**
 * Interface for objects representing a facet.
 *
 * Currently, this interface only supports:
 *  - facets without a parameter for the optionsEndpoint
 *  - facets with only one parameter for the filterEndpoint
 *  - for facets with type=multiple: only disjunctive facets
 */
export interface Facet {
  // Name of the endpoint that returns the options to be displayed in the facet
  optionsEndpoint: string;
  // Name of the endpoint that filters search results
  filterEndpoint: string;
  // Name of the parameter that is expected by the filterEndpoint
  filterParameterName: string;
  // Optional value of the parameter expected by the filterEndpoint
  filterParameterValue: string | undefined;
  // Type of this facet: 'single' means only one value can be selected,
  // 'multiple' means multiple values may be selected.
  type: 'single' | 'multiple';
}

/**
 * Associate Query objects with each other in a faceted search setup.
 */
export class FacetedSearch {
  // Internal list of Facet objects
  private _facets: Facet[] = [];

  constructor(
    // Query object for the search results that will serve as the base for this facet.
    // The searchQuery is used to fetch the options of the facet and will be filtered once
    // one or more facet options are selected.
    // The searchQuery must have at least one parameter.
    private searchQuery: Query,
    // emptyParameterQuery is used instead of searchQuery when the searchQuery parameters are all empty.
    // If no emptyParameterQuery is passed, searchQuery is fetched with empty parameters.
    private emptyParameterQuery?: Query,
  ) {
    // Throw an error if the searchQuery does not have parameters
    if (!searchQuery.parameters || Object.keys(searchQuery.parameters).length === 0) {
      throw new Error('searchQuery has no parameters. Please initialize with an empty parameter');
    }
  }

  /**
   * Add a facet to the FacetedSearch object.
   */
  addFacet(
    endpoint: string,
    type: 'single' | 'multiple' = 'single',
    filterEndpointPrefix = ':FILTER',
    filterEndpointParameterName = 'value',
  ) {
    this._facets.push({
      optionsEndpoint: endpoint,
      filterEndpoint: `${endpoint}${filterEndpointPrefix}`,
      filterParameterName: filterEndpointParameterName,
      filterParameterValue: undefined,
      type,
    });
  }

  get facets(): Facet[] {
    return this._facets;
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
  getResultsQuery(): Query[] {
    return [
      this.getBaseQuery(),
      ...this._facets
        .filter((f) => f.filterParameterValue !== undefined && f.filterParameterValue !== '')
        .map((f) => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string },
        })),
    ];
  }

  /**
   * Get the Query objects to retrieve the facet options. When using multiple facets, the facetEndpoint
   * parameter is required.
   */
  getFacetQuery(facetEndpoint: string): Query[] {
    const facet = this._facets.find((f) => f.optionsEndpoint === facetEndpoint);
    if (!facet) {
      throw new Error('Facet not found in FacetedSearch');
    }

    return [
      this.getBaseQuery(),
      ...this._facets
        .filter(
          (f) =>
            f.filterParameterValue !== undefined &&
            f.filterParameterValue !== '' &&
            f.optionsEndpoint !== facetEndpoint,
        )
        .map((f) => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string },
        })),
      { endpoint: facet.optionsEndpoint },
    ];
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
  public setFacetSelection(facetEndpoint: string, selection: string | string[]) {
    if (!(selection instanceof Array)) {
      selection = [selection];
    }
    const facet = this._facets.find((f) => f.optionsEndpoint === facetEndpoint);
    if (!facet) {
      throw new Error(`FacetedSearch does not contain facet ${facetEndpoint}`);
    }
    if (facet.type === 'single') {
      if (selection.length > 1) {
        throw new Error(
          `Facet ${facetEndpoint} is a single selection facet but more than one selected option was given.`,
        );
      }
      facet.filterParameterValue = selection[0];
    } else {
      facet.filterParameterValue = tupleListToString(selection);
    }
  }

  /**
   * Clear the selection for a given facet.
   */
  public clearFacetSelection(facetEndpoint?: string) {
    if (facetEndpoint) {
      const facet = this._facets.find((f) => f.optionsEndpoint === facetEndpoint);
      if (!facet) {
        throw new Error(`FacetedSearch does not contain facet ${facetEndpoint}`);
      }
      facet.filterParameterValue = '';
    } else {
      this._facets.forEach((f) => {
        f.filterParameterValue = '';
      });
    }
  }
}
