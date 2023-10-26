import { Authenticator } from './Authenticator';
import { ClientCredentials } from './ClientCredentials';
import { PKCE } from './PKCE';
import { TokenCache, localStorageTokenCache } from './TokenCache';

export const DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';

export { Authenticator, TokenCache, ClientCredentials, PKCE, localStorageTokenCache };
