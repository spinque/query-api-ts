import { ErrorResponse, Query, SpinqueResultObject } from '..';
import { Api } from '../Api';

describe('Api', () => {
  it('should be constructable without ApiConfig', () => {
    const api = new Api();
    expect(api).toBeDefined();
  });

  it('should be constructable with only a partial ApiConfig', () => {
    let api = new Api({
      workspace: 'my-workspace',
    });
    expect(api.workspace).toEqual('my-workspace');

    api = new Api({
      config: 'my-config',
    });
    expect(api.config).toEqual('my-config');

    api = new Api({
      version: 'my-version',
    });
    expect(api.version).toEqual('my-version');

    api = new Api({
      baseUrl: 'my-base-url',
    });
    expect(api.baseUrl).toEqual('my-base-url');

    api = new Api({
      workspace: 'my-workspace',
      version: 'my-version',
    });
    expect(api.workspace).toEqual('my-workspace');
    expect(api.version).toEqual('my-version');
  });

  it('should have a default base URL', () => {
    const api = new Api();
    expect(api.baseUrl).toEqual('https://rest.spinque.com/');
  });

  it('should not try to fetch 0 queries', async () => {
    const api = new Api({ workspace: 'my-workspace', api: 'my-api' });
    const queries: Query[] = [];
    await expect(api.fetch(queries)).rejects.toThrow('Queries array is empty');
  });

  it('should not try to fetch without an API name', async () => {
    const api = new Api({ workspace: 'course-main' });
    const queries: Query[] = [{ endpoint: 'my-endpoint' }];
    await expect(api.fetch(queries)).rejects.toThrow('API name missing');
  });

  it('should not try to fetch without a workspace name', async () => {
    const api = new Api({ api: 'movies' });
    const queries: Query[] = [{ endpoint: 'my-endpoint' }];
    await expect(api.fetch(queries)).rejects.toThrow('Workspace missing');
  });

});
