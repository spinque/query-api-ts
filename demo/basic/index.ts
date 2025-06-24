import { Api, Query, UnauthorizedError } from '../../src';
import { EndpointNotFoundError, RequestType } from '../../src/types';
import { urlFromQueries } from '../../src/utils';

async function main() {
  // Create Api object
  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies'
  });

  await basic(api);
  await statistics(api);
  await entityViews(api);
}

/**
 * Basic usage
 */
 async function basic(api: Api) {
  const queries: Query[] = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  try {
    const response = await api.fetch(queries, { count: 10, offset: 0 }, RequestType.Results);
    console.log(response);

    const url = urlFromQueries(api.apiConfig, queries, { count: 10, offset: 0 });
    console.log(url);
    // const response = await axios.get(url);
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      console.log('Unauthorized, this API requires authentication.');
    } else if (error instanceof EndpointNotFoundError) {
      console.log('This endpoint does not exist');
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

  const response = await api.fetch(queries, { }, RequestType.Statistics);
  console.log(response);
}

/**
 * Retrieving results using entity views
 */
async function entityViews(api: Api) {
  console.log('\nEntity views\n');

  const queries: Query[] = [{
    endpoint: 'movies',
  }];

  const response = await api.fetch(queries, { }, RequestType.ResultPage);
  console.log(response);
}


main();