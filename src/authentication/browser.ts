import { putInStorage, getFromStorage } from './TokenCacheBrowser';
import { Authenticator } from './Authenticator';
import { ClientCredentials } from './ClientCredentials';
import { PKCE } from './PKCE';

export const DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';
export const DEFAULT_AUDIENCE = 'https://rest.spinque.com/';

export { Authenticator, ClientCredentials, PKCE, putInStorage, getFromStorage };
