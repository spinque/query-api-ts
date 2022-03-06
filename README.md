# @spinque/query-api

TypeScript library to use the Spinque Query API in your project.

## Basic usage

Defining a single query:

```typescript
import { Query } from '@spinque/query-api';

const single_query: Query = {
  endpoint: 'movie_search',
  parameters: { terms: 'call me' }
};
```

Stacking queries, for example for faceted search:

```typescript
const stacked_queries: Query[] = [{
  endpoint: 'movie_search',
  parameters: { terms: 'call me' }
}, {
  endpoint: 'genres'
}];
```

Fetching results for a single query using an instance of the Api class:

```typescript
import { Api } from '@spinque/query-api';

const api = new Api({
  workspace: 'my-workspace',
  config: 'default',
  api: 'movies'
});

try {
  const response = await api.fetch(query, { count: 10, offset: 0 });
} catch (error: any) {
  console.error(error);
}
```

Getting the URL for a request to fetch it using your own HTTP-library of preference:

```typescript
import { Api } from '@spinque/query-api';

const apiConfig = {
  workspace: 'my-workspace',
  config: 'default',
  api: 'movies'
};

const url = urlFromQueries(apiConfig, query, { count: 10, offset: 0 });
```

