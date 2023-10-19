export const putInStorage = (path: string | undefined, accessToken: string, expires: number) => {
  try {
    require.resolve('fs');
    const fs = require('fs');
    const json = JSON.stringify({ accessToken, expires });
    fs.writeFileSync(path, json);
  } catch (e) {}
};

/**
 * Get an access token from storage (if available)
 */
export const getFromStorage = (path: string | undefined) => {
  if (!path) {
    return null;
  }
  try {
    require.resolve('fs');
    const data = require('fs').readFileSync(path, { encoding: 'utf8' });
    const { accessToken, expires } = JSON.parse(data);
    if (typeof accessToken !== 'string' && typeof expires !== 'number') {
      // TODO: delete file
      return null;
    }
    return { accessToken, expires };
  } catch (error) {
    return null;
  }
};
