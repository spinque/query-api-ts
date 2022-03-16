import { Query } from '..';
import { FacetedSearch } from '../FacetedSearch';

describe('FacetedSearch', () => {
  it('should be constructable with only a searchQuery', () => {
    const sq: Query = { endpoint: 'my-endpoint', parameters: { q: '' } };
    const fs = new FacetedSearch(sq);
    expect(fs).toBeDefined();
  });
});
