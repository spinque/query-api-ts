import { Api, FacetType, Query, stringifyQueries } from '..';
import {
  createFilteredSearchState,
  facet,
  FilteredSearch,
  getFacetQuery,
  getFilteredSearchResultsQuery,
  getFilterSelection,
  getFilterSelectionTuples,
  getResultsQuery,
  parameterizedFilter,
  simpleFilter,
  withFacet,
  withFilterSelection,
  withParameter,
} from '../FilteredSearch';

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

    fs2.setQueryStack(fs1.getResultsQuery());
    expect(stringifyQueries(fs1.getResultsQuery())).toEqual(stringifyQueries(fs2.getResultsQuery()));
  });

  it('should correctly set state with a query', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };

    const fs1 = new FilteredSearch(searchQuery);
    const fs2 = new FilteredSearch(searchQuery);

    fs1.setParameter('q', 'pulp fiction');

    fs2.setQueryStack(fs1.getResultsQuery());

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
    fs2.setQueryStack(fs1.getResultsQuery());

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
    fs2.setQueryStack(fs1.getResultsQuery());

    expect(stringifyQueries(fs1.getResultsQuery())).not.toEqual(stringifyQueries(fs2.getResultsQuery()));
  });

  it('should support immutable plain state updates', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const state = createFilteredSearchState(searchQuery);
    const withGenre = withFacet(state, 'genre');
    const withQuery = withParameter(withGenre, 'q', 'pulp fiction');
    const withSelection = withFilterSelection(withQuery, 'genre', 'Drama');

    expect(state.filters).toHaveLength(0);
    expect(withGenre.filters).toHaveLength(1);
    expect(withQuery.searchQuery.parameters?.['q']).toBe('pulp fiction');
    expect(getFilteredSearchResultsQuery(withSelection)).toEqual([
      { endpoint: 'my-endpoint', parameters: { q: 'pulp fiction' } },
      { endpoint: 'genre:FILTER', parameters: { value: 'Drama' } },
    ]);
  });

  it('should support declarative setup with filter factories', () => {
    const search = createFilteredSearchState({
      searchQuery: { endpoint: 'movie-search', parameters: { query: '' } },
      emptyParameterQuery: { endpoint: 'trending-movies' },
      filters: [
        facet('genre', { type: FacetType.multiple }),
        facet('director'),
        simpleFilter('type:movies'),
        parameterizedFilter('personalization', { filterParameterName: 'userid' }),
      ],
    });

    const withQuery = withParameter(search, 'query', 'pulp fiction');
    const withGenre = withFilterSelection(withQuery, 'genre', ['Drama', 'Crime']);
    const withUser = withFilterSelection(withGenre, 'personalization', 'user_123');

    expect(getResultsQuery(withUser)).toEqual([
      { endpoint: 'movie-search', parameters: { query: 'pulp fiction' } },
      { endpoint: 'genre:FILTER', parameters: { value: '1(Drama)|1(Crime)' } },
      { endpoint: 'type:movies', parameters: {} },
      { endpoint: 'personalization', parameters: { userid: 'user_123' } },
    ]);
    expect(getFacetQuery(withUser, 'director')).toEqual([
      { endpoint: 'movie-search', parameters: { query: 'pulp fiction' } },
      { endpoint: 'genre:FILTER', parameters: { value: '1(Drama)|1(Crime)' } },
      { endpoint: 'type:movies', parameters: {} },
      { endpoint: 'personalization', parameters: { userid: 'user_123' } },
      { endpoint: 'director' },
    ]);
  });

  it('should expose snapshots instead of mutable internals', () => {
    const searchQuery: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FilteredSearch(searchQuery);

    fs.addFacet('genre');
    fs.filters[0].filterEndpoint = 'mutated';

    expect(fs.filters[0].filterEndpoint).toBe('genre:FILTER');
  });

  describe('filter selection', () => {
    const state = createFilteredSearchState({
      searchQuery: { endpoint: 'search', parameters: { q: '' } },
      filters: [
        facet('genre', { type: FacetType.multiple }),
        facet('director'),
        simpleFilter('type:movies'),
        parameterizedFilter('personalization', { filterParameterName: 'userid' }),
      ],
    });

    it('returns [] when nothing is selected', () => {
      expect(getFilterSelection(state, 'genre')).toEqual([]);
      expect(getFilterSelection(state, 'director')).toEqual([]);
      expect(getFilterSelection(state, 'personalization')).toEqual([]);
    });

    it('round-trips single, multiple and parameterized selections', () => {
      const s1 = withFilterSelection(state, 'director', 'Tarantino');
      const s2 = withFilterSelection(s1, 'genre', ['Drama', 'Crime']);
      const s3 = withFilterSelection(s2, 'personalization', 'user_123');

      expect(getFilterSelection(s3, 'director')).toEqual(['Tarantino']);
      expect(getFilterSelection(s3, 'genre')).toEqual(['Drama', 'Crime']);
      expect(getFilterSelection(s3, 'personalization')).toEqual(['user_123']);
      expect(getFilterSelection(withFilterSelection(s3, 'genre', []), 'genre')).toEqual([]);
    });

    it('reads a facet selection via its options endpoint and a filter via its filter endpoint', () => {
      const selected = withFilterSelection(state, 'genre', 'Drama');
      expect(getFilterSelection(selected, 'genre')).toEqual(['Drama']);
      expect(getFilterSelection(selected, 'genre:FILTER')).toEqual(['Drama']);
    });

    it('supports tuple selections through getFilterSelectionTuples only', () => {
      const selected = withFilterSelection(state, 'genre', [
        ['a', 'b'],
        ['c', 'd'],
      ]);
      expect(getFilterSelectionTuples(selected, 'genre')).toEqual([
        ['a', 'b'],
        ['c', 'd'],
      ]);
      expect(() => getFilterSelection(selected, 'genre')).toThrow('tuple selections');
    });

    it('throws for unknown filters and filters without a parameter', () => {
      expect(() => getFilterSelection(state, 'nope')).toThrow('does not contain filter nope');
      expect(() => getFilterSelection(state, 'type:movies')).toThrow('does not have a parameter');
    });

    it('reads back values containing tuple list syntax', () => {
      const selected = withFilterSelection(state, 'genre', ['Schilderij, olieverf', '(geheel) drukinkt', 'Aardewerk']);
      expect(getFilterSelection(selected, 'genre')).toEqual(['Schilderij, olieverf', '(geheel) drukinkt', 'Aardewerk']);
    });

    it('is available on the FilteredSearch class', () => {
      const fs = new FilteredSearch({ endpoint: 'search', parameters: { q: '' } });
      fs.addFacet('genre', FacetType.multiple);
      fs.setFilterSelection('genre', ['Drama', 'Crime']);
      expect(fs.getFilterSelection('genre')).toEqual(['Drama', 'Crime']);
    });
  });
});
