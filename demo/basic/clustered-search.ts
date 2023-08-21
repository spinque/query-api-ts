import { Api, getClusters, isCluster } from '../../src';
import { ResultItem, ResultsResponse, SpinqueResultObject } from '../../src/types';

// This is what the results response for clustered search looks like
// It contains normal items with attributes and 'class' items that represent clusters of
// a certain class.
const DUMMY_RESPONSE_WITH_CLUSTERS: ResultsResponse<[SpinqueResultObject]> = {
  count: 5,
  offset: 0,
  type: ['OBJ'],
  items: [{
    probability: 1,
    rank: 1,
    tuple: [{
      id: 'http://example.org/1',
      class: ['https://schema.org/Thing'],
      attributes: {
        'http://example.org/attribute': 'value',
      }
    }]
  }, {
    probability: 0.9,
    rank: 2,
    tuple: [{
      // This is a cluster
      id: 'https://schema.org/Photograph',
      class: ['http://www.w3.org/2000/01/rdf-schema#Class']
    }]
  }, {
    probability: 0.8,
    rank: 3,
    tuple: [{
      id: 'http://example.org/2',
      class: ['https://schema.org/Thing'],
      attributes: {
        'http://example.org/attribute': 'value',
      }
    }]
  }, {
    probability: 0.7,
    rank: 4,
    tuple: [{
      // This is also a cluster
      id: 'https://schema.org/Person',
      class: ['http://www.w3.org/2000/01/rdf-schema#Class']
    }]
  }, {
    probability: 0.6,
    rank: 5,
    tuple: [{
      id: 'http://example.org/3',
      class: ['https://schema.org/Thing'],
      attributes: {
        'http://example.org/attribute': 'value',
      }
    }]
  }]
};

async function main() {
  const api = new Api({
    workspace: 'demo',
    config: 'default',
    api: 'demo'
  });

  // Here you would normally fetch results from a Spinque API endpoint. For this demo, we use a dummy response.
  const response = DUMMY_RESPONSE_WITH_CLUSTERS;

  // At this stage, the results can already be rendered. The clusters are known but their content not yet, so
  // a placeholder or loading indicator should be shown instead.

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
  const clusterRequests = clusters.map(cluster => api.fetch<[SpinqueResultObject]>(cluster.query));

  // Await for the responses to all requests
  const clusterResponses = await Promise.all(clusterRequests);

  for (let [index, cluster] of clusterResponses.entries()) {
    // replace placeholder with clustered items
  }
}

main();
