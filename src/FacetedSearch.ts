import { FilteredSearch } from './FilteredSearch';
import { FacetFilter } from './types';

// for backwards compat
export type Facet = FacetFilter;
export { FacetType } from './types';

/**
 * Do not extend FacetedSearch but instead use FilteredSearch.
 * FacetedSearch only still extists for backwards compatibility
 * and is defined in terms of FilteredSearch.
 */

/**
 * Associate Query objects with each other in a faceted search setup.
 *
 * @deprecated use FilteredSearch, a generalization of FacetedSearch
 */
export class FacetedSearch extends FilteredSearch {
  get facets(): FacetFilter[] {
    return this._filters.filter((f): f is FacetFilter => 'optionsEndpoint' in f);
  }

  /**
   * Set the selected options for a given facet.
   */
  public setFacetSelection(facetEndpoint: string, selection: string | string[]) {
    this.setFilterSelection(facetEndpoint, selection);
  }

  /**
   * Clear the selection for a given facet.
   */
  public clearFacetSelection(facetEndpoint?: string) {
    this.clearFilterSelection(facetEndpoint);
  }
}
