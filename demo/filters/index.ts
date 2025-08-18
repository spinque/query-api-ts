import { Api, FilteredSearch, getClusters, isCluster, parseQueries, stringifyQueries, urlFromQueries } from '../../src';
import {
  EndpointNotFoundError,
  FacetType,
  RequestType,
  ResultsResponse,
  SpinqueResultObject,
  UnauthorizedError,
} from '../../src/types';

/**
 * Example of the FilteredSearch class
 */
async function main() {
  // 1. configuration

  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies',
  });

  const fs = new FilteredSearch({
    endpoint: 'search',
    parameters: {
      query: '',
    },
  });

  fs.addFacet('genre', FacetType.multiple);

  // 2. user actions (coming from UI)

  fs.setParameter('query', 'pulp fiction');
  fs.setFilterSelection('genre', [['https://imdb.com/data/genre/Drama', 'Drama']]);

  // 3. get search results or facet options
  const results = fs.getResultsQuery();
  const genreOptions = fs.getFacetQuery('genre');

  try {
    const response = await api.fetch(results, { count: 10, offset: 0 }, RequestType.Results);
    console.log(response);
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      console.log('Unauthorized, this API requires authentication.');
    } else if (error instanceof EndpointNotFoundError) {
      console.log('This endpoint does not exist');
    } else {
      console.error(error);
    }
  }

  // optionally, the state can be serialized/parsed, e.g. to store in the page URL

  // serializedState is safe to be put in a URL
  const serializedState = stringifyQueries(results);

  // when read from the URL, the state can be parsed
  const parsedState = parseQueries(serializedState);
  // and then the entire FilteredSearch state can be set at once
  fs.setState(parsedState);
}

main();
