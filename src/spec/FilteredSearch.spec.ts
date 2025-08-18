import { Api, FacetType, Query, stringifyQueries } from '..';
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

  it('should correctly set state without filters or query', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };

    const fs1 = new FilteredSearch(searchQuery);
    const fs2 = new FilteredSearch(searchQuery);

    fs2.setState(fs1.getResultsQuery());
    expect(stringifyQueries(fs1.getResultsQuery())).toEqual(stringifyQueries(fs2.getResultsQuery()));
  });

  it('should correctly set state with a query', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };

    const fs1 = new FilteredSearch(searchQuery);
    const fs2 = new FilteredSearch(searchQuery);

    fs1.setParameter('q', 'pulp fiction');

    fs2.setState(fs1.getResultsQuery());

    expect(stringifyQueries(fs1.getResultsQuery())).toEqual(stringifyQueries(fs2.getResultsQuery()));
  });

  it('should correctly set state with a query and filters', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };

    const fs1 = new FilteredSearch(searchQuery);
    const fs2 = new FilteredSearch(searchQuery);

    // add some filters of different kinds (structure)
    fs1.addSimpleFilter('type:movies');
    fs1.addParameterizedFilter('personalization', true, 'userid');
    fs1.addFacet('genre', FacetType.multiple);

    fs2.addSimpleFilter('type:movies');
    fs2.addParameterizedFilter('personalization', true, 'userid');
    fs2.addFacet('genre', FacetType.multiple);

    // set query and filter selections (state)
    fs1.setParameter('q', 'pulp fiction');
    fs1.setFilterSelection('personalization', 'user_123');
    fs1.setFilterSelection('genre', [
      ['https://data.example.com/genre/Drama', 'Drama'],
      ['https://data.example.com/genre/Crime', 'Crime'],
    ]);

    // transfer state to fs2
    fs2.setState(fs1.getResultsQuery());

    expect(stringifyQueries(fs1.getResultsQuery())).toEqual(stringifyQueries(fs2.getResultsQuery()));
  });

  it('should ignore unknown filters when setting state', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };

    const fs1 = new FilteredSearch(searchQuery);
    const fs2 = new FilteredSearch(searchQuery);

    // add some filters of different kinds (structure)
    fs1.addSimpleFilter('type:movies');
    fs1.addParameterizedFilter('personalization', true, 'userid');
    fs1.addFacet('genre', FacetType.multiple);

    fs2.addSimpleFilter('type:movies');
    fs2.addParameterizedFilter('personalization', true, 'userid');
    // fs2.addFacet('genre', FacetType.multiple);

    // set query and filter selections (state)
    fs1.setParameter('q', 'pulp fiction');
    fs1.setFilterSelection('personalization', 'user_123');
    fs1.setFilterSelection('genre', [
      ['https://data.example.com/genre/Drama', 'Drama'],
      ['https://data.example.com/genre/Crime', 'Crime'],
    ]);

    // transfer state to fs2
    fs2.setState(fs1.getResultsQuery());

    expect(stringifyQueries(fs1.getResultsQuery())).not.toEqual(stringifyQueries(fs2.getResultsQuery()));
  });
});
