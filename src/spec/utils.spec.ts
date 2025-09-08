import { pathFromQueries, pathFromQuery, tupleListToString, urlFromQueries } from '../utils';
import { ApiConfig, Query, RequestType } from '..';

describe('utils', () => {
  it('pathFromQuery should convert a Query to a string', () => {
    const q1: Query = { endpoint: 'my-endpoint' };
    expect(typeof pathFromQuery(q1)).toBe('string');
  });

  it('pathFromQuery should convert a Query to a path that does not start with a slash', () => {
    const q1: Query = { endpoint: 'my-endpoint' };
    expect(pathFromQuery(q1)[0]).not.toBe('/');
  });

  it('pathFromQuery should convert a Query without parameter to a simple path starting with e', () => {
    const q1: Query = { endpoint: 'my-endpoint' };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint');
  });

  it('pathFromQuery should use URL encoding in endpoint names', () => {
    const q1: Query = { endpoint: 'my-"crazy$-endpoint' };
    expect(pathFromQuery(q1)).toBe('e/my-%22crazy%24-endpoint');
  });

  it('pathFromQuery should not use URL encoding for the colon in facet filter :FILTER convention', () => {
    const q1: Query = { endpoint: 'facet:FILTER' };
    expect(pathFromQuery(q1)).toBe('e/facet:FILTER');
  });

  it('pathFromQuery should add parameters to the path', () => {
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'my-param': 'my-value' } };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint/p/my-param/my-value');
  });

  it('pathFromQuery should use URL encoding in parameter names', () => {
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'my-"crazy$-param': 'my-value' } };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint/p/my-%22crazy%24-param/my-value');
  });

  it('pathFromQuery should use URL encoding in parameter values', () => {
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'my-param': 'my-"crazy$-value' } };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint/p/my-param/my-%22crazy%24-value');
  });

  it('pathFromQuery should add multiple parameters to the path', () => {
    const q1: Query = {
      endpoint: 'my-endpoint',
      parameters: { one: 'value-one', two: 'value-two', three: 'value-three' },
    };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint/p/one/value-one/p/two/value-two/p/three/value-three');
  });

  it('pathFromQueries should work the same as pathFromQuery for a single Query', () => {
    const q1: Query = {
      endpoint: 'my-endpoint',
      parameters: { one: 'value-one', two: 'value-two', three: 'value-three' },
    };
    expect(pathFromQuery(q1)).toEqual(pathFromQueries([q1]));

    const q2: Query = { endpoint: 'my-"crazy$-endpoint' };
    expect(pathFromQuery(q2)).toEqual(pathFromQueries([q2]));
  });

  it('pathFromQueries should join multiple Queries together', () => {
    const q1: Query = {
      endpoint: 'my-endpoint',
      parameters: { one: 'value-one', two: 'value-two', three: 'value-three' },
    };
    const q2: Query = { endpoint: 'my-"crazy$-endpoint' };
    expect(pathFromQueries([q1, q2])).toEqual(pathFromQuery(q1) + '/' + pathFromQuery(q2));
    expect(pathFromQueries([q1, q2])).toEqual(
      'e/my-endpoint/p/one/value-one/p/two/value-two/p/three/value-three/e/my-%22crazy%24-endpoint',
    );
    expect(pathFromQueries([q2, q1])).toEqual(pathFromQuery(q2) + '/' + pathFromQuery(q1));
  });

  it('urlFromQueries should prepend pathFromQueries with the base URL, version and workspace', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'my-config',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results?config=my-config',
    );
  });

  it('urlFromQueries should add count and offset parameters', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'my-config',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, { count: 314, offset: 15 })).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results?config=my-config&count=314&offset=15',
    );
  });

  it('urlFromQueries should fail without a baseUrl, version, workspace or API name', () => {
    const query: Query = { endpoint: 'my-endpoint' };

    const apiConfig1: ApiConfig = {
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'my-config',
    };
    expect(() => urlFromQueries(apiConfig1, query)).toThrow('Base URL missing');

    const apiConfig2: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'my-config',
    };
    expect(() => urlFromQueries(apiConfig2, query)).toThrow('Version missing');

    const apiConfig3: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      api: 'my-api',
      config: 'my-config',
    };
    expect(() => urlFromQueries(apiConfig3, query)).toThrow('Workspace missing');

    const apiConfig4: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      config: 'my-config',
    };
    expect(() => urlFromQueries(apiConfig4, query)).toThrow('API name missing');
  });

  it('urlFromQueries should not fail without config', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results',
    );
  });

  it('urlFromQueries should be able to request statistics', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, {}, RequestType.Statistics)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/statistics?config=default',
    );
  });

  it('urlFromQueries should be able to request count', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, {}, RequestType.Count)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/count?config=default',
    );
  });

  it('urlFromQueries should be able to request results and count', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, {}, RequestType.ResultsAndCount)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results,count?config=default',
    );
  });

  it('urlFromQueries should be able to request result item', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, { rank: 1, column: 1 }, RequestType.ResultItem)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/resultitem?config=default&rank=1&column=1',
    );
  });
  
  it('urlFromQueries should be able to request Entity Views result page', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query, {}, RequestType.ResultPage)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/resultpage?config=default',
    );
  });
  
  it('urlFromQueries should be able to request facet options', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query[] = [{ endpoint: 'my-endpoint' }, { endpoint: 'other-facet' }];
    expect(urlFromQueries(apiConfig, query, {}, RequestType.Options)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/options/other-facet?config=default',
    );
  });
    
  it('urlFromQueries should be able to request facet options with active filters', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query[] = [{ endpoint: 'my-endpoint' }, { endpoint: 'some-facet:FILTER', parameters: { value: '1(some-value)' } }, { endpoint: 'other-facet' }];
    expect(urlFromQueries(apiConfig, query, {}, RequestType.Options)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/e/some-facet:FILTER/p/value/1(some-value)/options/other-facet?config=default',
    );
  });

  it('urlFromQueries should be able to request facet options with active filters and replace :FILTER if present in the last filter', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'default',
    };
    const query: Query[] = [{ endpoint: 'my-endpoint' }, { endpoint: 'some-facet:FILTER', parameters: { value: '1(some-value)' } }];
    expect(urlFromQueries(apiConfig, query, {}, RequestType.Options)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/options/some-facet?config=default',
    );
  });

  it('tupleListToString should convert everything to strings', () => {
    expect(typeof tupleListToString(0)).toEqual('string');
    expect(typeof tupleListToString('hello')).toEqual('string');
  });

  it('tupleListToString should convert single strings or numbers', () => {
    expect(tupleListToString('hello')).toEqual('1(hello)');
    expect(tupleListToString(123)).toEqual('1(123)');
  });

  it('tupleListToString should convert an array of strings or numbers', () => {
    expect(tupleListToString(['hello'])).toEqual('1(hello)');
    expect(tupleListToString(['hello', 'there'])).toEqual('1(hello)|1(there)');
    expect(tupleListToString([123])).toEqual('1(123)');
    expect(tupleListToString([123, 456])).toEqual('1(123)|1(456)');
    expect(tupleListToString([123, 'marco'])).toEqual('1(123)|1(marco)');
    expect(tupleListToString(['polo', '456'])).toEqual('1(polo)|1(456)');
  });

  it('tupleListToString should convert an array of arrays of strings or numbers', () => {
    expect(
      tupleListToString([
        ['hello', 'there'],
        ['marco', 'polo'],
        [123, 456],
      ]),
    ).toEqual('1(hello,there)|1(marco,polo)|1(123,456)');
  });

  it('tupleListToString should throw an error if arrays are not of equal length', () => {
    expect(() => tupleListToString([['hello', 'there'], ['marco'], [123, 456]])).toThrow();
  });

  it('tupleListToString should use scores if passed', () => {
    expect(
      tupleListToString(
        [
          ['hello', 'there'],
          ['marco', 'polo'],
          [123, 456],
        ],
        [0.1, 0.5, 3.1415],
      ),
    ).toEqual('0.1(hello,there)|0.5(marco,polo)|3.1415(123,456)');
  });

  it('tupleListToString should throw an error if scores length does not match arrays length', () => {
    expect(() => tupleListToString([['hello', 'there'], ['marco'], [123, 456]], [])).toThrow();
    expect(() => tupleListToString([['hello', 'there'], ['marco'], [123, 456]], [1])).toThrow();
    expect(() => tupleListToString([['hello', 'there'], ['marco'], [123, 456]], [1, 2])).toThrow();
    expect(() => tupleListToString([['hello', 'there'], ['marco'], [123, 456]], [1, 2, 3, 4])).toThrow();
  });
});
