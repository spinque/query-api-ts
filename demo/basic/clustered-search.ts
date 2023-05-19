import { getClusters } from '../../src';
import { ResultsResponse } from '../../src/types';

async function main() {
  // This is what the results response for clustered search looks like
  const response: ResultsResponse = {
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

  const clusters = getClusters(response);
}



main();