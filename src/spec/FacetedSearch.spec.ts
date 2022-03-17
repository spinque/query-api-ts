import { Api, Query } from '..';
import { FacetedSearch } from '../FacetedSearch';

describe('FacetedSearch', () => {
  it('should be constructable with only a searchQuery', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    expect(fs).toBeDefined();
  });

  it('should be able to set facets', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre');
    expect(fs.facets).toBeDefined();
    expect(fs.facets.length).toEqual(1);
  });

  it('should create single-select facets by default', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre');
    expect(fs.facets[0].type).toEqual('single');
  });

  it('should set the facet value using setFacetSelection for single-select', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre');
    fs.setFacetSelection('genre', 'a');
    expect(fs.facets[0].filterParameterValue).toEqual('a');
  });

  it('should set the facet value using setFacetSelection for multiple-select', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre', 'multiple');
    fs.setFacetSelection('genre', ['a', 'b']);
    expect(fs.facets[0].filterParameterValue).toEqual('1(a)|1(b)');
  });

  it('should not allow multiple values to be selected for single-select facets', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre');
    expect(() => fs.setFacetSelection('genre', ['a', 'b'])).toThrow();
  });

  it('should create mulitple-select facets on request', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    fs.addFacet('genre', 'multiple');
    expect(fs.facets[0].type).toEqual('multiple');
  });
});
