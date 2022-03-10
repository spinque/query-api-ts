import { Query } from "./types";
import { tupleListToString, urlFromQueries } from "./utils";

export interface Facet {
  optionsEndpoint: string;
  filterEndpoint: string;
  filterParameterName: string;
  filterParameterValue: string | undefined;
  type: 'single' | 'multiple';
}

/**
 * Associate Query objects with each other in a faceted search setup.
 */
export class FacetedSearch {
  private facets: Facet[] = [];

  constructor(private searchQuery: Query, private emptyParameterQuery?: Query) {
    if (!searchQuery.parameters || Object.keys(searchQuery.parameters).length === 0) {
      throw new Error('searchQuery has no parameters. Please initialize with an empty parameter');
    }
  }

  /**
   * Add a facet to the FacetedSearch object.
   * 
   * @returns FacetedSearch
   */
  public withFacet(endpoint: string, type: 'single' | 'multiple' = 'single', filterEndpointPrefix = ':FILTER', filterEndpointParameterName = 'value'): FacetedSearch {
    this.facets.push({
      optionsEndpoint: endpoint,
      filterEndpoint: `${endpoint}${filterEndpointPrefix}`,
      filterParameterName: filterEndpointParameterName,
      filterParameterValue: undefined,
      type
    });
    return this;
  }

  getBaseQuery(): Query {
    if (
      this.emptyParameterQuery &&
      (!this.searchQuery.parameters ||
      Object.keys(this.searchQuery.parameters).length === 0 ||
      Object.values(this.searchQuery.parameters).every(p => !p || p === ''))
    ) {
      return this.emptyParameterQuery;
    } else {
      return this.searchQuery;
    }
  }

  getResultsQueries(): Query[] {
    return [
      this.getBaseQuery(),
      ...this.facets
        .filter(f => f.filterParameterValue !== undefined && f.filterParameterValue !== '')
        .map(f => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string }
        }))
    ];
  }

  getFacetOptions(facetEndpoint?: string): Query[] {
    let facet;
    if (facetEndpoint) {
      facet = this.facets.find(f => f.optionsEndpoint === facetEndpoint);
    } else if (this.facets.length > 1) {
      throw new Error('The facet to get options for has to be specified whenever FactedSearch has more than one facet.');
    } else {
      facet = this.facets[0];
    }
    if (!facet) {
      throw new Error('Facet not found in FacetedSearch');
    }

    return [
      this.getBaseQuery(),
      ...this.facets
        .filter(f => f.filterParameterValue !== undefined && f.filterParameterValue !== '' && f.optionsEndpoint !== facetEndpoint)
        .map(f => ({
          endpoint: f.filterEndpoint,
          parameters: { [f.filterParameterName]: f.filterParameterValue as string }
        })),
      { endpoint: facet.optionsEndpoint }
    ];
  }

   public setParameter(name: string, value: string) {
    this.searchQuery = {
      ...this.searchQuery,
      parameters: {
        ...this.searchQuery.parameters,
        [name]: value
      }
    };
  }

  public clearParameters() {
    this.searchQuery = {
      ...this.searchQuery,
      parameters: Object.keys(this.searchQuery.parameters || {}).reduce((acc, cur) => ({ ...acc, [cur]: '' }), {})
    };
  }

  public setFacetSelection(facetEndpoint: string, selection: string | string[]) {
    if (!(selection instanceof Array)) {
      selection = [selection];
    }
    const facet = this.facets.find(f => f.optionsEndpoint === facetEndpoint);
    if (!facet) {
      throw new Error(`FacetedSearch does not contain facet ${facetEndpoint}`);
    }
    if (facet.type === 'single') {
      if (selection.length > 1) {
        throw new Error(`Facet ${facetEndpoint} is a single selection facet but more than one selected option was given.`);
      }
      facet.filterParameterValue = selection[0];
    } else {
      facet.filterParameterValue = tupleListToString(selection);
    }
  }

  public clearFacetSelection(facetEndpoint?: string) {
    if (facetEndpoint) {
      const facet = this.facets.find(f => f.optionsEndpoint === facetEndpoint);
      if (!facet) {
        throw new Error(`FacetedSearch does not contain facet ${facetEndpoint}`);
      }
      facet.filterParameterValue = '';
    } else {
      this.facets.forEach(f => {
        f.filterParameterValue = '';
      });
    }
  }

}
