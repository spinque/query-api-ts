import { Api, Query } from '../../../src';

async function main() {
  // Client Credentials flow

  // Use the OAuth Client Credentials flow when your application
  // is in a completely trusted environment, such as on a server.

  const api = new Api({
    workspace: 'course-main',
    config: 'default',
    api: 'movies',
    // Add a config section with authentication details
    // For the Client Credentials flow, get a Client ID and Secret
    // from Spinque Desk > Settings > Team Members > Add System-to-System Account
    authentication: {
      type: 'client-credentials',
      clientId: 'OhZpdNNu9hWUsVpTZnYa9DzWLLbivlEH',
      clientSecret: 'cOo6uGbRw7H_qdaZ3EO_jgr3wSKIfJapC0WxV3hPzLEsxnvtL_gukQXYQrw3mq9m',
    },
  });

  const queries: Query[] = [
    {
      endpoint: 'movie',
      parameters: { id: 'https://imdb.com/data/movie/tt0209144' },
    },
  ];

  try {
    // Fetch response (or get URL and use your own HTTP library)
    const response = await api.fetch(queries, { count: 10, offset: 0 });
    console.log(response);

    setTimeout(async () => {
      const response = await api.fetch(queries, { count: 10, offset: 0 });
      console.log(response);
    }, 15 * 1000);
  } catch (error) {
    console.log(error);
  }
}

main();
