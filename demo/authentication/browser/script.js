/**
 * To test this demo, you need to build the library, browserify this demo and run a webserver.
 * You also need to have access to a Client ID that accepts the PKCE flow. If you're interested in this,
 * please contact the system administrator at Spinque.
 * 
 * For example:
 *  - npm run build
 *  - cd demo/authentication/browser
 *  - ./browserify.sh
 *  - python -m http.server 4200
 */

const sqa = require("../../../dist");

async function main() {
  const apiWithAuth = new sqa.Api({
    workspace: 'course-main',
    api: 'movies',
    authentication: {
      type: 'pkce',
      clientId: '9xa3MpWBCeG72XCohLIYAVigdiL00OvO',
      callback: 'http://localhost:4200'
    },
    tokenCache: sqa.localStorageTokenCache
  });

  const queries = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  // const response = await apiWithAuth.fetch(queries, { count: 10, offset: 0 });

  // console.log(response);
  // alert('Check the console for the results');
}

main();