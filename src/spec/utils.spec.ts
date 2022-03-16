import { pathFromQueries, pathFromQuery, urlFromQueries } from '../utils';
import { ApiConfig, Query } from '..';

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
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'one': 'value-one', 'two': 'value-two', 'three': 'value-three' } };
    expect(pathFromQuery(q1)).toBe('e/my-endpoint/p/one/value-one/p/two/value-two/p/three/value-three');
  });


  it('pathFromQueries should work the same as pathFromQuery for a single Query', () => {
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'one': 'value-one', 'two': 'value-two', 'three': 'value-three' } };
    expect(pathFromQuery(q1)).toEqual(pathFromQueries([q1]));

    const q2: Query = { endpoint: 'my-"crazy$-endpoint' };
    expect(pathFromQuery(q2)).toEqual(pathFromQueries([q2]));
  });

  it('pathFromQueries should join multiple Queries together', () => {
    const q1: Query = { endpoint: 'my-endpoint', parameters: { 'one': 'value-one', 'two': 'value-two', 'three': 'value-three' } };
    const q2: Query = { endpoint: 'my-"crazy$-endpoint' };
    expect(pathFromQueries([q1, q2])).toEqual(pathFromQuery(q1) + '/' + pathFromQuery(q2));
    expect(pathFromQueries([q1, q2])).toEqual('e/my-endpoint/p/one/value-one/p/two/value-two/p/three/value-three/e/my-%22crazy%24-endpoint');
    expect(pathFromQueries([q2, q1])).toEqual(pathFromQuery(q2) + '/' + pathFromQuery(q1));
  });

  it('urlFromQueries should prepend pathFromQueries with the base URL, version and workspace', () => {
    const apiConfig: ApiConfig = {
      baseUrl: 'https://rest.spinque.com/',
      version: '4',
      workspace: 'my-workspace',
      api: 'my-api',
      config: 'my-config'
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query)).toEqual('https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results?config=my-config');
  });
});
