import { Query, ResultItem, ResultItemTupleTypes, ResultsResponse, SpinqueResultObject } from './types';
import { tupleListToString } from './utils';

export interface Cluster {
  probability: number;
  rank: number;
  class: string[];
  query: Query;
}

interface GetClustersOptions {
  clusterEndpoint?: string;
  clusterParameterName?: string;
  clusterParameterType?: 'STRING' | 'TUPLE_LIST';
  knownClusters?: string[];
}

const DEFAULT_CLUSTER_ENDPOINT: NonNullable<GetClustersOptions['clusterEndpoint']> = 'type:FILTER';
const DEFAULT_CLUSTER_PARAMETER_NAME: NonNullable<GetClustersOptions['clusterParameterName']> = 'value';
const DEFAULT_CLUSTER_PARAMETER_TYPE: NonNullable<GetClustersOptions['clusterParameterType']> = 'TUPLE_LIST';

const RDFS_CLASS = 'http://www.w3.org/2000/01/rdf-schema#Class';

/**
 * Taskes a ResultsResponse, finds clusters in the results and returns a list of Cluster objects.
 * These Cluster objects contain a Query that can be used to fetch the contents of the clusters
 * by stacking the Query on top of the results Query[].
 */
export const getClusters = (results: ResultsResponse, options: GetClustersOptions = {}) => {
  const endpoint = options.clusterEndpoint ?? DEFAULT_CLUSTER_ENDPOINT;
  const parameterName = options.clusterParameterName ?? DEFAULT_CLUSTER_PARAMETER_NAME;
  const parameterType = options.clusterParameterType ?? DEFAULT_CLUSTER_PARAMETER_TYPE;

  const clusters: Cluster[] = [];

  // Loop through result items and when encountering a cluster, add it to the list
  for (let item of results.items) {
    if (!isCluster(item)) {
      continue;
    }
    const cluster = {
      probability: item.probability,
      rank: item.rank,
      class: item.tuple[0].class,
      query: {
        endpoint,
        parameters: {
          [parameterName]: parameterType === 'TUPLE_LIST' ? tupleListToString([item.tuple[0].id]) : item.tuple[0].id,
        },
      },
    };
    clusters.push(cluster);
  }

  return clusters;
};

/**
 * Takes a result item and checks if it is a cluster.
 * A result is considered a cluster when it's of type rdfs:Class.
 */
export const isCluster = (item: ResultItem): item is ResultItem<[SpinqueResultObject]> => {
  if (!item.tuple || item.tuple.length !== 1 || typeof item.tuple[0] === 'string' || typeof item.tuple[0] === 'number') {
    return false;
  }
  return item.tuple[0].class.includes(RDFS_CLASS);
};
