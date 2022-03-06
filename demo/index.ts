import { Api, Query, UnauthorizedError } from '../src';
import { tupleListToString, urlFromQueries } from '../src/utils';

async function main() {
  // Create Api object
  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies'
  });

  await basic(api);
  await statistics(api);
  await facet(api);
  await authentication(api);
}

/**
 * Basic usage
 */
 async function basic(api: Api) {
  console.log('\nBasic\n');

  const queries: Query[] = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  try {
    const response = await api.fetch(queries, { count: 10, offset: 0 });
    // console.log(await response.json());

    const url = urlFromQueries(api.apiConfig, queries, { count: 10, offset: 0 });
    console.log(url);
    // const response = await axios.get(url);
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      console.log('Unauthorized, this API requires authentication.');      
    } else {
      console.error(error);
    }
  }
}

/**
 * Retrieving statistics for a query
 */
 async function statistics(api: Api) {
  console.log('\nStatistics\n');

  const queries: Query[] = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  const response = await api.fetch(queries, { }, 'statistics');
  console.log(response);
}

/**
 * Showing search results and a facet
 */
 async function facet(api: Api) {
  console.log('\nFacet\n');

  // Construct the query for the main search results
  const search: Query[] = [{
    endpoint: 'movie_search',
    parameters: { query: 'call me' }
  }];
  // Construct the query for the facet options (query is stacked on top of the search query)
  const facet: Query[] = [...search, { endpoint: 'genre' }];

  // Call these two in parallel
  const [searchResults, facetOptions] = await Promise.all([api.fetch(search), api.fetch(facet)]);

  // Show the results
  console.log('Search results for \'call me\': ', searchResults);
  console.log('Options in \'genre\' facet: ', facetOptions);


  // Now suppose the user selects a genre from the facet


  // Selected options from the facet
  const selected = ['https://imdb.com/data/genre/Drama'];

  // Update the search results by applying the facet filter endpoint
  const facetedSearch: Query[] = [{
    endpoint: 'movie_search',
    parameters: { query: 'call me' }
  }, {
    endpoint: 'genre:FILTER',
    parameters: { value: tupleListToString(selected) }
  }];

  // Update the facet options query by stacking it on top of the new search results
  const updatedFacet: Query[] = [...facetedSearch, { endpoint: 'genre' }];

  // Fetch both in parallel
  const [facetedSearchResults, updatedFacetOptions] = await Promise.all([api.fetch(facetedSearch), api.fetch(updatedFacet)]);

  // Show the results
  console.log('Search results for \'call me\' with facet applied: ', facetedSearchResults);
  console.log('Options in \'genre\' with facet applied: ', updatedFacetOptions);
}


/**
 * Using an API that requires authentication
 */
 async function authentication(api: Api) {
  console.log('\nAuthentication\n');

  const apiWithAuth = new Api({
    ...api.apiConfig,
    // Add a config section with authentication details
    // For the Client Credentials flow, get a Client ID and Secret
    // from Spinque Desk > Settings > Team Members > Add System-to-System Account
    authentication: {
      type: 'client-credentials',
      clientId: 'OhZpdNNu9hWUsVpTZnYa9DzWLLbivlEH',
      clientSecret: 'cOo6uGbRw7H_qdaZ3EO_jgr3wSKIfJapC0WxV3hPzLEsxnvtL_gukQXYQrw3mq9m'
    }
  });

  const queries: Query[] = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  const response = await apiWithAuth.fetch(queries, { count: 10, offset: 0 });
  console.log(response);
}

main();