import { Api, ResultsResponse } from '../../src';
import { FacetedSearch } from '../../src/FacetedSearch';

async function main() {
  // Create Api object
  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies',

    authentication: {
      type: 'client-credentials',
      clientId: 'OhZpdNNu9hWUsVpTZnYa9DzWLLbivlEH',
      clientSecret: 'cOo6uGbRw7H_qdaZ3EO_jgr3wSKIfJapC0WxV3hPzLEsxnvtL_gukQXYQrw3mq9m',
    },
  });

  await facet(api);
}

/**
 * Using FacetedSearch to manage queries in a simple faceted search setup.
 */
 async function facet(api: Api) {
  try {
    /**
     * Initialization
     */

    // Define the search query, start with an empty parameter
    const searchQuery = {
      endpoint: 'movie_search',
      parameters: { query: '' }
    };

    // Optionally, we can default an alternative endpoint for when the parameters of the search query are empty
    const listQuery = {
      endpoint: 'movies'
    };

    // Define the relation between different Queries in a FacetedSearch instance
    const fs = new FacetedSearch(searchQuery, listQuery).withFacet('genre', 'multiple');

    // Get results (will fetch the listQuery) and facet options
    let results = await api.fetch(fs.getResultsQueries());
    let options = await api.fetch(fs.getFacetOptions());

    /**
     * Interaction
     */

    // Set the search query parameter (e.g. after the user has typed something)
    fs.setParameter('query', 'call me');

    // Get results (will fetch the searchQuery) and facet options
    results = await api.fetch(fs.getResultsQueries());
    options = await api.fetch(fs.getFacetOptions());

    // Select a facet option
    fs.setFacetSelection('genre', (options as ResultsResponse).items[0].tuple[0].id);

    // Get results again
    results = await api.fetch(fs.getResultsQueries());

  } catch (error) {
    console.log(error);
  }

}


main();