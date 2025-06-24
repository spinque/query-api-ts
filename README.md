# @spinque/query-api

[![npm version](https://img.shields.io/npm/v/@spinque/query-api.svg?style=flat-square)](https://www.npmjs.org/package/@spinque/query-api)
[![install size](https://packagephobia.now.sh/badge?p=@spinque/query-api)](https://packagephobia.now.sh/result?p=@spinque/query-api)
[![Known Vulnerabilities](https://snyk.io/test/npm/@spinque/query-api/badge.svg)](https://snyk.io/test/npm/@spinque/query-api)

Library to use the Spinque Query API in your JavaScript/TypeScript project.

The Spinque Query API is an HTTP API to retrieve search results for queries.
Also check out the
[documentation of the Spinque Query API](https://docs.spinque.com/3.0/using-apis/basic.html).

## Table of contents

- [Installing](https://github.com/spinque/query-api-ts#installing)
- [Documentation](https://github.com/spinque/query-api-ts#documentation)
- [Usage](https://github.com/spinque/query-api-ts#usage)
  - [Defining queries](https://github.com/spinque/query-api-ts#defining-queries)
  - [Fetching results](https://github.com/spinque/query-api-ts#fetching-results)
  - [Fetching using custom HTTP-library](https://github.com/spinque/query-api-ts#fetching-using-custom-http-library)
  - [Authentication](https://github.com/spinque/query-api-ts#authentication)
  - [Utility functions](https://github.com/spinque/query-api-ts#utility-functions)
  - [Faceted search](https://github.com/spinque/query-api-ts#faceted-search)
  - [Clustered search](https://github.com/spinque/query-api-ts#clustered-search)
  - [Vanilla JavaScript](https://github.com/spinque/query-api-ts#vanilla-javascript)

## Installing

Using npm:

```bash
$ npm install @spinque/query-api
```

Note: when using this library with NodeJS, version >= 18 is expected for `fetch` support.

## Documentation

Documentation for this library can be found
[here](https://spinque.github.io/query-api-ts/).

For documentation on the Spinque Query API itself, please see
[this](https://docs.spinque.com/3.0/using-apis/basic.html).

## Usage

### Defining queries

Defining a single query:

```typescript
import { Query } from "@spinque/query-api";

const query: Query = {
  endpoint: "movie_search",
  parameters: { terms: "call me" },
};
```

### Fetching results

Fetching results for a single query using an instance of the Api class and its
`fetch` method:

```typescript
import { Api, Query } from "@spinque/query-api";

// Configure the API with workspace, configuration and API name
const api = new Api({
  workspace: "my-workspace",
  config: "default",
  api: "movies",
});

// Construct the query to fetch results for
const query: Query = {
  endpoint: "movie_search",
  parameters: { terms: "call me" },
};

try {
  // Fetch the 10 first results of the query
  const results = await api.fetch(query, { count: 10 });
} catch (error: any) {
  console.error(error);
}
```

You can also fetch other type of responses:
```typescript
import { RequestType } from "@spinque/query-api";

const statistics = await api.fetch(query, { count: 10 }, RequestType.Statistics);
const resultsWithCount = await api.fetch(query, { count: 10 }, RequestType.ResultsAndCount);
```

You can bring your own [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) for `fetch`:
```typescript
const requestInit: RequestInit = {
  cache: 'no-cache'
};
const results = await api.fetch(query, { count: 10 }, 'results', requestInit);
```

### Fetching using custom HTTP-library

Getting the URL for a request to fetch it using your own HTTP-library of
preference:

```typescript
import { urlFromQueries } from "@spinque/query-api/utils";

const apiConfig = {
  workspace: "my-workspace",
  config: "default",
  api: "movies",
};

const query: Query = {
  endpoint: "movie_search",
  parameters: { terms: "call me" },
};

const url = urlFromQueries(apiConfig, query, { count: 10, offset: 0 });

// Make the request here using `url`
```

### Authentication

Some Spinque APIs require authentication using OAuth 2.0. The Client Credentials
flow (for server applications) and PKCE flow (for browser applications) are
provided by `@spinque/query-api`:

#### PKCE flow (for browser applications)

```typescript
import { Api } from "@spinque/query-api";

const api = new Api({
  workspace: "my-workspace",
  config: "default",
  api: "movies",
  authentication: {
    type: "pkce",
    clientId: "abcdefghijklmnopqrstuvwxyz",
    callback: "https://my-domain.com/callback",
  },
});

const query = {
  endpoint: "movie",
  parameters: { id: "https://imdb.com/data/movie/tt0209144" },
};

const response = await api.fetch(queries, { count: 10, offset: 0 });
```

Note: the Client ID and Callback URL cannot yet be configured from Spinque Desk.
Ask your system administrator to help you out.

#### Client Credentials flow (for server applications)

```typescript
import { Api } from "@spinque/query-api";

const api = new Api({
  workspace: "my-workspace",
  config: "default",
  api: "movies",
  authentication: {
    type: "client-credentials",
    clientId: "abcdefghijklmnopqrstuvwxyz",
    clientSecret: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  },
});

const query: Query = {
  endpoint: "movie_search",
  parameters: { terms: "call me" },
};

const response = await api.fetch(queries);
```

The Client ID and Client Secret can be generated by creating a new
System-to-System account in the Settings > Team Members section of Spinque Desk.

It is strongly recommended you use a token cache. `@spinque/query-api` will log a warning message if you don't use a token cache.

The implementation of the cache is up to you. An example implementation that uses the filesystem:

```typescript
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
```

Then during the creation of the API object:

```typescript
const api = new Api({
  ...,
  authentication: {
    ...,
    tokenCache: fileSystemTokenCache
  },
});
```

### Utility functions

Many utility functions are available for import under
`@spinque/query-api/utils`.

- `urlFromQueries`, takes an ApiConfig object and an array of Query objects and
  returns a Spinque Query API request URL.
- `pathFromQuery`, takes a single Query and returns the path of its Spinque
  Query API URL.
- `pathFromQueries`, takes an array of Query objects and returns the path of
  their Spinque Query API URL.
- `join`, joints together URL parts into a valid URL.
- `stringifyQueries`, takes an array of Query objects and returns a string
  representation that can be used to e.g. store in the address baer.
- `parseQueries`, takes a string from `stringifyQueries` and tries to parse it
  into an array of Query objects.
- `stringToTupleList`, given a string, try to parse it as a tuple list (array of
  arrays of numbers or strings, and array of scores).
- `tupleListToString`, given a tuple list, return a string representation.
- `ensureTupleList`, takes a value (string, number, array of strings or numbers,
  or array of arrays of strings or numbers) and normalizes it into a tuple list.

See the [documentation](https://spinque.github.io/query-api-ts/) for a complete
list.

### Faceted search

_Faceted search_ is a common pattern found in applications built on Spinque.
This library provides a FacetedSearch to ease the interaction between queries in
a faceted search setup.

The following example shows how a search endpoint 'movie_search' can be used in
combination with facet endpoints 'genre' and 'director'.

```typescript
import { Api, FacetedSearch } from "@spinque/query-api";

const query: Query = {
  endpoint: "movie_search",
  parameters: { query: "call me" },
};

const fs = new FacetedSearch(query);

fs.addFacet("genre", "multiple");
fs.addFacet("director", "single");

// Get results and facet options
let results = await api.fetch(fs.getResultsQuery());
let genreOptions = await api.fetch(fs.getFacetQuery("genre"));
let directorOptions = await api.fetch(fs.getFacetQuery("director"));

// Set the search query parameter (e.g. after the user has typed something)
fs.setParameter("query", "dia");

// Get updated results and options
results = await api.fetch(fs.getResultsQuery());
genreOptions = await api.fetch(fs.getFacetQuery("genre"));
directorOptions = await api.fetch(fs.getFacetQuery("director"));

// Select some facet options
fs.setFacetSelection("genre", [
  "https://imdb.com/data/Drama",
  "https://imdb.com/data/Biography",
]);
fs.setFacetSelection("director", "https://imdb.com/data/PabloLarrain");

// Get results again, now with facets applied
results = await api.fetch(fs.getResultsQuery());
```

Optionally, you can provide a Query for when the search parameters are empty.

```typescript
...

const listQuery: Query = { endpoint: 'movies' };

const fs = new FacetedSearch(query, listQuery);
```

Note that the exact same behavior can also be achieved _without_ the
FacetedSearch class (though it's more involved). The following two sections
produce equal results:

With FacetedSearch:

```typescript
const query: Query = {
  endpoint: "movie_search",
  parameters: { query: "call me" },
};

const fs = new FacetedSearch(query);

fs.addFacet("genre", "multiple");
fs.addFacet("director", "single");

let results = await api.fetch(fs.getResultsQuery());
let genreOptions = await api.fetch(fs.getFacetQuery("genre"));
let directorOptions = await api.fetch(fs.getFacetQuery("director"));

fs.setParameter("query", "dia");

results = await api.fetch(fs.getResultsQuery());
genreOptions = await api.fetch(fs.getFacetQuery("genre"));
directorOptions = await api.fetch(fs.getFacetQuery("director"));

fs.setFacetSelection("genre", [
  "https://imdb.com/data/Drama",
  "https://imdb.com/data/Biography",
]);

results = await api.fetch(fs.getResultsQuery());
```

Without FacetedSearch:

```typescript
const query: Query = {
  endpoint: "movie_search",
  parameters: { query: "call me" },
};

const genreOptionsQuery: Query = { endpoint: "genre" };
const genreFilterQuery: Query = {
  endpoint: "genre:FILTER",
  parameters: { value: undefined },
};

const directorOptionsQuery: Query = { endpoint: "director" };
const directorFilterQuery: Query = {
  endpoint: "director:FILTER",
  parameters: { value: undefined },
};

let resultsQuery = [query];
if (genreFilterQuery.parameters.value) {
  resultsQuery.push(genreFilterQuery);
}
if (directorFilterQuery.parameters.value) {
  resultsQuery.push(directorFilterQuery);
}

let results = await api.fetch(resultsQuery);
let genreOptions = await api.fetch([...resultsQuery, genreOptionsQuery]);
let directorOptions = await api.fetch([...resultsQuery, directorOptionsQuery]);

query.parameters.query = "dia";

let resultsQuery = [query];
if (genreFilterQuery.parameters.value) {
  resultsQuery.push(genreFilterQuery);
}
if (directorFilterQuery.parameters.value) {
  resultsQuery.push(directorFilterQuery);
}

results = await api.fetch(resultsQuery);
let genreOptions = await api.fetch([...resultsQuery, genreOptionsQuery]);
let directorOptions = await api.fetch([...resultsQuery, directorOptionsQuery]);

genreFilterQuery.parameters.value = tupleListToString([
  "https://imdb.com/data/Drama",
  "https://imdb.com/data/Biography",
]);

let resultsQuery = [query];
if (genreFilterQuery.parameters.value) {
  resultsQuery.push(genreFilterQuery);
}
if (directorFilterQuery.parameters.value) {
  resultsQuery.push(directorFilterQuery);
}

results = await api.fetch(resultsQuery);
```

### Clustered search

Another common pattern in application built on Spinque is _clustered search_. A
group of results (of a certain class) is positioned in the result list. Think of
the group of images that's often found in your Google results.

An endpoint with clustered search, will return an item of type
[`rdfs:Class`](http://www.w3.org/2000/01/rdf-schema#Class) where a cluster
should be placed. This item represents the cluster but it does not contain the
clustered items themselves yet. Encountering it means your application has to
fetch the clustered items next. The identifier of this representative item will
be the class of the cluster, for example `https://schema.org/Photograph`. This
can be used to fetch the cluster contents. Note: this is an opinionated
convention that you could choose to diverge from.

This is what the response of an endpoint with clustered search could look like. Note: results at ranks 2 and 4 represent clusters, the rest do not.

```json
{
  "count": 5,
  "offset": 0,
  "type": ["OBJ"],
  "items": [
    {
      "probability": 1,
      "rank": 1,
      "tuple": [
        {
          "id": "http://example.org/1",
          "class": ["https://schema.org/Thing"],
          "attributes": { "http://example.org/attribute": "value" }
        }
      ]
    },
    {
      "probability": 0.9,
      "rank": 2,
      "tuple": [
        {
          "id": "https://schema.org/Photograph",
          "class": ["http://www.w3.org/2000/01/rdf-schema#Class"]
        }
      ]
    },
    {
      "probability": 0.8,
      "rank": 3,
      "tuple": [
        {
          "id": "http://example.org/2",
          "class": ["https://schema.org/Thing"],
          "attributes": { "http://example.org/attribute": "value" }
        }
      ]
    },
    {
      "probability": 0.7,
      "rank": 4,
      "tuple": [
        {
          "id": "https://schema.org/Person",
          "class": ["http://www.w3.org/2000/01/rdf-schema#Class"]
        }
      ]
    },
    {
      "probability": 0.6,
      "rank": 5,
      "tuple": [
        {
          "id": "http://example.org/3",
          "class": ["https://schema.org/Thing"],
          "attributes": { "http://example.org/attribute": "value" }
        }
      ]
    }
  ]
}
```

For the clusters at rank 2 and 4, the application requests the contents from the
Spinque API.

This library provides some tools to help build this pattern:

- The
  [`getClusters`](https://spinque.github.io/query-api-ts/functions/getClusters.html)
  function, that identifies clusters in search results.
- The
  [`isCluster`](https://spinque.github.io/query-api-ts/functions/isCluster/html)
  function, that returns whether an item is a cluster.

An example of a clustered search implementation using these functions:

```javascript
const api = new Api({
  workspace: "demo",
  config: "default",
  api: "demo",
});

const response = await api.fetch({
  endpoint: "search",
  parameters: { query: "utrecht" },
});

// At this stage, the normal results can already be rendered. The clusters are known but their content not yet, so
// a placeholder or loading indicator should be shown instead.

// Dummy rendering loop:
for (let item of response.items) {
  if (isCluster(item)) {
    // show placeholder for a cluster
  } else {
    // show the full item
  }
}

// Get the clusters in the response and load their contents
const clusters = getClusters(response);

// Map all clusters to a request for their contents using `api.fetch`
const clusterRequests = clusters.map((cluster) =>
  api.fetch < [SpinqueResultObject] > (cluster.query)
);

// Await for the responses to all requests
// Note: it's possible to postpone fetching cluster results until the cluster is scrolled into view
const clusterResponses = await Promise.all(clusterRequests);

for (let [index, cluster] of clusterResponses.entries()) {
  // Replace placeholder with clustered items
}

// Note: more cluster items could be loaded if the user indicates interest
```

### Vanilla JavaScript

This library can also be used without using TypeScript:

```javascript
const sqa = require("@spinque/query-api");

const api = new sqa.Api({
  workspace: "my-workspace",
  api: "movies",
});

const query = {
  endpoint: "search",
  parameters: { term: "utrecht" },
};

try {
  const results = await api.fetch(query);
  console.log(results);
} catch (error) {
  console.log(error);
}
```
