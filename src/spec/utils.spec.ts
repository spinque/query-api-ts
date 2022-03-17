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
      api: 'my-api'
    };
    const query: Query = { endpoint: 'my-endpoint' };
    expect(urlFromQueries(apiConfig, query)).toEqual(
      'https://rest.spinque.com/4/my-workspace/api/my-api/e/my-endpoint/results',
    );
  });
});
