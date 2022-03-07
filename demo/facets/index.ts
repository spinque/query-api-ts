import { Api, Query } from '../../src';
import { tupleListToString } from '../../src/utils';

async function main() {
  // Create Api object
  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies'
  });

  await facet(api);
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


main();