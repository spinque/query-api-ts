import { Query } from '..';
import { Api } from '../Api';
import fetchMock from 'jest-fetch-mock';

// jest.setMock("cross-fetch", fetchMock);

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

  // it('should not try to fetch 0 queries', async () => {
  //   const api = new Api({ workspace: 'my-workspace' });
  //   const queries: Query[] = [];
  //   const res = api.fetch(queries).catch((error) => {
  //     console.log(error);
  //     expect(error).toEqual('');
  //   });
  //   await res;
  //   expect(1).toEqual(1);

  //   // expect(() => {
  //   // }).toThrow();
  // });

  // it('should not try to fetch without workspace', () => {
  //   const api = new Api();
  //   const queries: Query[] = [{ endpoint: 'my-endpoint' }];
  //   expect(() => {
  //     api.fetch(queries);
  //   }).toThrow();
  // });

  // it('should try to fetch single query', async () => {
  //   const api = new Api({ workspace: 'my-workspace' });
  //   const queries: Query[] = [{ endpoint: 'my-endpoint' }];
  //   const response = await api.fetch(queries);
  //   expect(response).toBeDefined();
  // });
});
