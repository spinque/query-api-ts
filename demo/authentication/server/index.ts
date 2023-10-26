import { Api, Query, TokenCache } from '../../../src';

const fs = require('fs');

const TOKEN_CACHE_PATH = '/tmp/spinque.token';

export const fileSystemTokenCache: TokenCache = {
  get: () => {
    try {
      const data = fs.readFileSync(TOKEN_CACHE_PATH, { encoding: 'utf8' });
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  },
  set: (accessToken, expires) => {
    try {
      const data = JSON.stringify({ accessToken, expires });
      return fs.writeFileSync(TOKEN_CACHE_PATH, data);
    } catch (e) {}
  },
};

const createApi = () =>
  new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'demo',
    // Add a config section with authentication details
    // For the Client Credentials flow, get a Client ID and Secret
    // from Spinque Desk > Settings > Team Members > Add System-to-System Account
    authentication: {
      type: 'client-credentials',
      clientId: '57LX9miPDlxWU1YskTKMwBAaGvn8Tzgo',
      clientSecret: 'mgz38DUofG112FEIZ4eHJz2RvlGMY5KR0EKakscMHDPG8aE5Quxts_7CrxFXsccA',
      // tokenCache: fileSystemTokenCache,
    },
  });

async function main() {
  // Client Credentials flow

  // Use the OAuth Client Credentials flow when your application
  // is in a completely trusted environment, such as on a server.

  const api = createApi();

  const queries: Query[] = [
    {
      endpoint: 'joe',
    },
  ];

  try {
    let api = createApi();
    // Fetch response (or get URL and use your own HTTP library)
    const response = await api.fetch(queries, { count: 10, offset: 0 });

    const accessToken = `${api.accessToken}`;

    console.log(response);

    setTimeout(async () => {
      api = createApi();
      const response = await api.fetch(queries, { count: 10, offset: 0 });
      console.log(response);
      console.log(`Same access token used?`, api.accessToken === accessToken);
    }, 1000);
  } catch (error) {
    console.log(error);
  }
}

main();
