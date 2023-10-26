/**
 * Interface to implement token caching.
 */
export interface TokenCache {
  /**
   * Get a token and expiration timestamp from storage.
   */
  get: () => { accessToken: string; expires: number } | null;

  /**
   * Put a token and expiration timestamp into storage.
   */
  set: (token: string, expires: number) => void;
}

/**
 * Implementation of TokenCache that uses localStorage to cache tokens.
 */
export const localStorageTokenCache: TokenCache = {
  get: () => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const accessToken = localStorage.getItem('@spinque/query-api/access-token');
      const expires = parseInt(localStorage.getItem('@spinque/query-api/expires') || '', 10);
      if (accessToken && expires && expires > Date.now() + 1000) {
        return { accessToken, expires };
      } else {
        localStorage.removeItem('@spinque/query-api/access-token');
        localStorage.removeItem('@spinque/query-api/expires');
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  set: (token: string, expires: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(`@spinque/query-api/access-token`, token);
    localStorage.setItem(`@spinque/query-api/expires`, `${expires}`);
  },
};
