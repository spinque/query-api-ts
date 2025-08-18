import { Api, FacetType, Query } from '..';
import { FilteredSearch } from '../FilteredSearch';

describe('FilteredSearch', () => {
  it('should be constructable with only a searchQuery', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    expect(fs).toBeDefined();
  });

  it('should be able to set facet filters', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre');
    expect(fs.filters).toBeDefined();
    expect(fs.filters.length).toEqual(1);
  });

  it('should create single-select facets by default', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre');
    expect('optionsEndpoint' in fs.filters[0] && fs.filters[0].type).toEqual('single');
  });

  it('should set the facet value using setFilterSelection for single-select', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre');
    fs.setFilterSelection('genre', 'a');
    expect('optionsEndpoint' in fs.filters[0] && fs.filters[0].filterParameterValue).toEqual('a');
  });

  it('should set the facet value using setFilterSelection for multiple-select', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre', FacetType.multiple);
    fs.setFilterSelection('genre', ['a', 'b']);
    expect('optionsEndpoint' in fs.filters[0] && fs.filters[0].filterParameterValue).toEqual('1(a)|1(b)');
  });

  it('should not allow multiple values to be selected for single-select facets', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre');
    expect(() => fs.setFilterSelection('genre', ['a', 'b'])).toThrow();
  });

  it('should create mulitple-select facets on request', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addFacet('genre', FacetType.multiple);
    expect('optionsEndpoint' in fs.filters[0] && fs.filters[0].type).toEqual(FacetType.multiple);
  });

  it('should create parameterized filters', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addParameterizedFilter('genre');
    expect(fs.filters.length).toBe(1);
    expect(fs.filters[0].filterEndpoint).toBe('genre');
    expect('optionsEndpoint' in fs.filters[0]).toBeFalsy();
    expect('filterParameterName' in fs.filters[0] && fs.filters[0].filterParameterName === 'value');
  });

  it('should create simple filters', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(sq);
    fs.addSimpleFilter('genre');
    expect(fs.filters.length).toBe(1);
    expect(fs.filters[0].filterEndpoint).toBe('genre');
    expect('optionsEndpoint' in fs.filters[0]).toBeFalsy();
    expect('filterParameterName' in fs.filters[0]).toBeFalsy();
  });
});
