export const putInStorage = (key: string | undefined, accessToken: string, expires: number) => {
  // TODO: configure keys
  localStorage.setItem(`@spinque/query-api/access-token`, accessToken);
  localStorage.setItem(`@spinque/query-api/expires`, `${expires}`);
};

/**
 * Get an access token from storage (if available)
 */
export const getFromStorage = (key: string | undefined) => {
  if (!localStorage) {
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
};
