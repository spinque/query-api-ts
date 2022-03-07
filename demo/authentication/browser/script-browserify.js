(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const sqa = require("../../../dist");

async function main() {
  const apiWithAuth = new sqa.Api({
    workspace: 'course-main',
    api: 'movies',
    authentication: {
      type: 'pkce',
      clientId: '9xa3MpWBCeG72XCohLIYAVigdiL00OvO',
      callback: 'http://localhost:4200'
    }
  });

  const queries = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  const response = await apiWithAuth.fetch(queries, { count: 10, offset: 0 });

  console.log(response);
  alert('Check the console for the results');
}

main();
},{"../../../dist":7}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
var cross_fetch_1 = require("cross-fetch");
var authentication_1 = require("./authentication");
var types_1 = require("./types");
var utils_1 = require("./utils");
var DEFAULT_BASE_URL = 'https://rest.spinque.com/';
var Api = /** @class */ (function () {
    function Api(apiConfig) {
        this._baseUrl = DEFAULT_BASE_URL;
        this._version = '4';
        this._config = 'default';
        if (apiConfig && apiConfig.baseUrl) {
            this._baseUrl = apiConfig.baseUrl;
        }
        if (apiConfig && apiConfig.version) {
            this._version = apiConfig.version;
        }
        if (apiConfig && apiConfig.workspace) {
            this._workspace = apiConfig.workspace;
        }
        if (apiConfig && apiConfig.api) {
            this._api = apiConfig.api;
        }
        if (apiConfig && apiConfig.config) {
            this._config = apiConfig.config;
        }
        if (apiConfig && apiConfig.authentication) {
            if (apiConfig.authentication.type === 'client-credentials') {
                this._authentication = apiConfig.authentication;
                this._authenticator = new authentication_1.ClientCredentials(apiConfig.authentication.clientId, apiConfig.authentication.clientSecret, apiConfig.authentication.authServer, apiConfig.baseUrl || DEFAULT_BASE_URL);
            }
            if (apiConfig.authentication.type === 'pkce') {
                this._authentication = apiConfig.authentication;
                this._authenticator = new authentication_1.PKCE(apiConfig.authentication.clientId, apiConfig.authentication.callback, apiConfig.authentication.authServer, apiConfig.baseUrl || DEFAULT_BASE_URL);
            }
        }
    }
    Object.defineProperty(Api.prototype, "baseUrl", {
        get: function () {
            return this._baseUrl;
        },
        set: function (value) {
            this._baseUrl = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "version", {
        get: function () {
            return this._version;
        },
        set: function (value) {
            this._version = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "workspace", {
        get: function () {
            return this._workspace;
        },
        set: function (value) {
            this._workspace = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "api", {
        get: function () {
            return this._api;
        },
        set: function (value) {
            this._api = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (value) {
            this._config = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "authentication", {
        get: function () {
            return this._authentication;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "apiConfig", {
        get: function () {
            return {
                workspace: this.workspace,
                version: this.version,
                baseUrl: this.baseUrl,
                config: this.config,
                api: this.api,
                authentication: this.authentication,
            };
        },
        enumerable: false,
        configurable: true
    });
    Api.prototype.fetch = function (queries, options, requestType) {
        if (requestType === void 0) { requestType = 'results'; }
        return __awaiter(this, void 0, void 0, function () {
            var url, requestInit, token;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(queries instanceof Array)) {
                            queries = [queries];
                        }
                        if (queries.length === 0) {
                            throw new Error('Queries array is empty');
                        }
                        url = (0, utils_1.urlFromQueries)(this.apiConfig, queries, options, requestType);
                        requestInit = {};
                        if (!(this.authentication && this._authenticator)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._authenticator.accessToken];
                    case 1:
                        token = _a.sent();
                        requestInit = { headers: new cross_fetch_1.Headers({ Authorization: "Bearer ".concat(token) }) };
                        _a.label = 2;
                    case 2: 
                    // Make the request
                    return [2 /*return*/, (0, cross_fetch_1.default)(url, requestInit).then(function (res) { return _this.handleErrors(res); })];
                }
            });
        });
    };
    Api.prototype.handleErrors = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, response.json()];
                    case 1:
                        json = _a.sent();
                        if (response.status === 200) {
                            return [2 /*return*/, json];
                        }
                        if (response.status === 401) {
                            throw new types_1.UnauthorizedError(json.message, 401);
                        }
                        if (response.status === 400 && json.message.startsWith('no endpoint')) {
                            throw new types_1.EndpointNotFoundError(json.message, 400);
                        }
                        if (response.status === 500) {
                            throw new types_1.ServerError(json.message, 401);
                        }
                        throw new types_1.ErrorResponse('Unknown error: ' + (json.message || ''), response.status);
                }
            });
        });
    };
    return Api;
}());
exports.Api = Api;

},{"./authentication":6,"./types":8,"./utils":9,"cross-fetch":11}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = exports.DEFAULT_AUTH_SERVER = void 0;
var browser_or_node_1 = require("browser-or-node");
exports.DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';
var Authenticator = /** @class */ (function () {
    function Authenticator() {
        var _this = this;
        this._authInProgress = true;
        this._waitForAccessToken = new Promise(function (resolve) {
            var wait = function () {
                setTimeout(function () { return (!_this._authInProgress && _this._accessToken ? resolve(_this._accessToken) : wait()); }, 100);
            };
            wait();
        });
        var res = this.getFromStorage();
        // tslint:disable-next-line: no-console
        console.log(res);
        if (res) {
            // tslint:disable-next-line: no-console
            console.log('Found AT in storage');
            this._accessToken = res.accessToken;
            this._expires = res.expires;
            this._authInProgress = false;
        }
        else {
            this._authInProgress = false;
        }
    }
    Object.defineProperty(Authenticator.prototype, "accessToken", {
        get: function () {
            var _this = this;
            // tslint:disable-next-line: no-console
            console.log('Someone requests access token');
            // If the class already stores an access token, return it
            if (this._accessToken && this._expires && this._expires > (Date.now() + 1000)) {
                // tslint:disable-next-line: no-console
                console.log('Return AT from class');
                return Promise.resolve(this._accessToken);
            }
            // If the class is already authenticating, wait for it
            if (this._authInProgress) {
                // tslint:disable-next-line: no-console
                console.log('but he/she shall have to wait');
                return this._waitForAccessToken;
            }
            this._authInProgress = true;
            return this.fetchAccessToken().then(function (res) {
                _this._authInProgress = false;
                if (res && 'accessToken' in res && 'expiresIn' in res) {
                    _this.setAccessToken(res.accessToken, res.expiresIn);
                    return _this._accessToken;
                }
                else {
                    return undefined;
                }
            });
        },
        enumerable: false,
        configurable: true
    });
    Authenticator.prototype.setAccessToken = function (accessToken, expiresIn) {
        this._accessToken = accessToken;
        this._expires = Date.now() + expiresIn;
        this.putInStorage(this._accessToken, this._expires);
        this._authInProgress = false;
    };
    Authenticator.prototype.putInStorage = function (accessToken, expires) {
        if (!browser_or_node_1.isBrowser || !localStorage) {
            return;
        }
        // TODO: configure keys
        localStorage.setItem('@spinque/query-api/access-token', accessToken);
        localStorage.setItem('@spinque/query-api/expires', "".concat(expires));
    };
    Authenticator.prototype.getFromStorage = function () {
        if (!browser_or_node_1.isBrowser || !localStorage) {
            // tslint:disable-next-line: no-console
            console.log(browser_or_node_1.isBrowser, localStorage);
            return null;
        }
        try {
            var accessToken = localStorage.getItem('@spinque/query-api/access-token');
            var expires = parseInt(localStorage.getItem('@spinque/query-api/expires') || '', 10);
            if (accessToken && expires && expires > (Date.now() + 1000)) {
                return { accessToken: accessToken, expires: expires };
            }
            else {
                // tslint:disable-next-line: no-console
                console.log('EXPIRED!', accessToken, expires, (Date.now() + 1000), expires > (Date.now() + 1000));
                localStorage.removeItem('@spinque/query-api/access-token');
                localStorage.removeItem('@spinque/query-api/expires');
                return null;
            }
        }
        catch (error) {
            // tslint:disable-next-line: no-console
            console.log(error);
            return null;
        }
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;

},{"browser-or-node":10}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCredentials = void 0;
var Authenticator_1 = require("./Authenticator");
var path_1 = require("path");
var browser_or_node_1 = require("browser-or-node");
var cross_fetch_1 = require("cross-fetch");
var ClientCredentials = /** @class */ (function (_super) {
    __extends(ClientCredentials, _super);
    function ClientCredentials(clientId, clientSecret, authServer, baseUrl) {
        var _this = _super.call(this) || this;
        _this.clientId = clientId;
        _this.clientSecret = clientSecret;
        _this.authServer = authServer;
        _this.baseUrl = baseUrl;
        if (browser_or_node_1.isBrowser) {
            throw new Error('The Client Credentials Flow is only allowed for server applications.');
        }
        return _this;
    }
    ClientCredentials.prototype.fetchAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var authServer, body, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authServer = this.authServer || Authenticator_1.DEFAULT_AUTH_SERVER;
                        body = {
                            grant_type: 'client_credentials',
                            client_id: this.clientId,
                            client_secret: this.clientSecret,
                            audience: this.baseUrl,
                        };
                        return [4 /*yield*/, (0, cross_fetch_1.default)((0, path_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new cross_fetch_1.Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
                                body: Object.entries(body)
                                    .map(function (_a) {
                                    var key = _a[0], value = _a[1];
                                    return "".concat(key, "=").concat(value);
                                })
                                    .join('&'),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (response.status !== 200 || !json || !json.access_token || !json.expires_in) {
                            throw new Error(json.error_description || json.error || response.status);
                        }
                        return [2 /*return*/, {
                                accessToken: json.access_token,
                                expiresIn: json.expires_in
                            }];
                }
            });
        });
    };
    ;
    return ClientCredentials;
}(Authenticator_1.Authenticator));
exports.ClientCredentials = ClientCredentials;

},{"./Authenticator":3,"browser-or-node":10,"cross-fetch":11,"path":12}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToBase64UrlEncoded = exports.sha256 = exports.createRandomString = exports.getCryptoSubtle = exports.getCrypto = exports.PKCE = void 0;
var Authenticator_1 = require("./Authenticator");
var path_1 = require("path");
var browser_or_node_1 = require("browser-or-node");
var cross_fetch_1 = require("cross-fetch");
var PKCE = /** @class */ (function (_super) {
    __extends(PKCE, _super);
    function PKCE(clientId, callback, authServer, baseUrl) {
        var _this = _super.call(this) || this;
        _this.clientId = clientId;
        _this.callback = callback;
        _this.authServer = authServer;
        _this.baseUrl = baseUrl;
        if (!browser_or_node_1.isBrowser) {
            throw new Error('PKCE is only available for browser applications');
        }
        _this.checkForCallback();
        return _this;
    }
    PKCE.prototype.checkForCallback = function () {
        var _this = this;
        // Get query parameters from URL
        var params = Object.fromEntries((new URLSearchParams(window.location.search)).entries());
        if (!params.code || !params.state) {
            return;
        }
        this._authInProgress = true;
        this.tradeCodeForToken(params.code, params.state).catch(function () { return _this.authorize(); });
    };
    PKCE.prototype.fetchAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authorize()];
            });
        });
    };
    PKCE.prototype.authorize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var authServer, verifier, challenge, _a, state, params, authorizationUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authServer = this.authServer || Authenticator_1.DEFAULT_AUTH_SERVER;
                        verifier = (0, exports.createRandomString)();
                        _a = exports.bufferToBase64UrlEncoded;
                        return [4 /*yield*/, (0, exports.sha256)(verifier)];
                    case 1:
                        challenge = _a.apply(void 0, [_b.sent()]);
                        state = (0, exports.createRandomString)();
                        // Store the verifier and state so we can access it again after navigating the user to login.spinque.com
                        localStorage.setItem('@spinque/query-api/pkce-verifier', verifier);
                        localStorage.setItem('@spinque/query-api/pkce-state', state);
                        params = {
                            response_type: 'code',
                            code_challenge: challenge,
                            code_challenge_method: 'S256',
                            client_id: this.clientId,
                            redirect_uri: this.callback,
                            audience: this.baseUrl,
                            scope: '',
                            state: state
                        };
                        authorizationUrl = (0, path_1.join)(authServer, 'authorize');
                        authorizationUrl += "?".concat(Object.entries(params).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, "=").concat(value);
                        }).join('&'));
                        window.location.href = authorizationUrl;
                        // tslint:disable-next-line: no-empty
                        return [2 /*return*/, new Promise(function () { })];
                }
            });
        });
    };
    PKCE.prototype.tradeCodeForToken = function (code, state) {
        return __awaiter(this, void 0, void 0, function () {
            var storedState, verifier, authServer, body, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._accessToken) {
                            // tslint:disable-next-line: no-console
                            console.log('Already has access token so going to ignore callback');
                            return [2 /*return*/];
                        }
                        storedState = localStorage.getItem('@spinque/query-api/pkce-state');
                        if (storedState !== state) {
                            throw new Error('PKCE state parameter does not match expected value.');
                        }
                        verifier = localStorage.getItem('@spinque/query-api/pkce-verifier');
                        if (!verifier) {
                            throw new Error('Unable to find code verifier in local storage.');
                        }
                        authServer = this.authServer || Authenticator_1.DEFAULT_AUTH_SERVER;
                        body = {
                            grant_type: 'authorization_code',
                            client_id: this.clientId,
                            code_verifier: verifier,
                            redirect_uri: this.callback,
                            code: code
                        };
                        return [4 /*yield*/, (0, cross_fetch_1.default)((0, path_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new cross_fetch_1.Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
                                body: Object.entries(body)
                                    .map(function (_a) {
                                    var key = _a[0], value = _a[1];
                                    return "".concat(key, "=").concat(value);
                                })
                                    .join('&'),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (!(response.status === 403 && json && json.error && json.error === 'invalid_grant')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.fetchAccessToken()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (response.status !== 200 || !json || !json.access_token || !json.expires_in) {
                            throw new Error(json.error_description || json.error || response.status);
                        }
                        this.setAccessToken(json.access_token, json.expires_in);
                        // tslint:disable-next-line: no-console
                        console.log('access token received!');
                        return [2 /*return*/];
                }
            });
        });
    };
    return PKCE;
}(Authenticator_1.Authenticator));
exports.PKCE = PKCE;
/**
 * Crypto stuff for PKCE
 * Most of this is taken from: https://github.com/auth0/auth0-spa-js (MIT licensed)
 */
var getCrypto = function () {
    return (window.crypto || window.msCrypto);
};
exports.getCrypto = getCrypto;
var getCryptoSubtle = function () {
    var crypto = (0, exports.getCrypto)();
    return crypto.subtle || crypto.webkitSubtle;
};
exports.getCryptoSubtle = getCryptoSubtle;
var createRandomString = function () {
    var charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
    var random = '';
    var randomValues = Array.from((0, exports.getCrypto)().getRandomValues(new Uint8Array(43)));
    randomValues.forEach(function (v) { return (random += charset[v % charset.length]); });
    return random;
};
exports.createRandomString = createRandomString;
var sha256 = function (s) { return __awaiter(void 0, void 0, void 0, function () {
    var digestOp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                digestOp = (0, exports.getCryptoSubtle)().digest({ name: 'SHA-256' }, new TextEncoder().encode(s));
                if (window.msCrypto) {
                    return [2 /*return*/, new Promise(function (res, rej) {
                            digestOp.oncomplete = function (e) {
                                res(e.target.result);
                            };
                            digestOp.onerror = function (e) {
                                rej(e.error);
                            };
                            digestOp.onabort = function () {
                                rej('The digest operation was aborted');
                            };
                        })];
                }
                return [4 /*yield*/, digestOp];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.sha256 = sha256;
var bufferToBase64UrlEncoded = function (input) {
    var ie11SafeInput = new Uint8Array(input);
    return urlEncodeB64(window.btoa(String.fromCharCode.apply(String, Array.from(ie11SafeInput))));
};
exports.bufferToBase64UrlEncoded = bufferToBase64UrlEncoded;
var urlEncodeB64 = function (input) {
    var b64Chars = { '+': '-', '/': '_', '=': '' };
    return input.replace(/[+/=]/g, function (m) { return b64Chars[m]; });
};

},{"./Authenticator":3,"browser-or-node":10,"cross-fetch":11,"path":12}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PKCE = exports.ClientCredentials = exports.Authenticator = void 0;
var Authenticator_1 = require("./Authenticator");
Object.defineProperty(exports, "Authenticator", { enumerable: true, get: function () { return Authenticator_1.Authenticator; } });
var ClientCredentials_1 = require("./ClientCredentials");
Object.defineProperty(exports, "ClientCredentials", { enumerable: true, get: function () { return ClientCredentials_1.ClientCredentials; } });
var PKCE_1 = require("./PKCE");
Object.defineProperty(exports, "PKCE", { enumerable: true, get: function () { return PKCE_1.PKCE; } });

},{"./Authenticator":3,"./ClientCredentials":4,"./PKCE":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.UnauthorizedError = exports.ErrorResponse = exports.Api = void 0;
var Api_1 = require("./Api");
Object.defineProperty(exports, "Api", { enumerable: true, get: function () { return Api_1.Api; } });
var types_1 = require("./types");
Object.defineProperty(exports, "ErrorResponse", { enumerable: true, get: function () { return types_1.ErrorResponse; } });
Object.defineProperty(exports, "UnauthorizedError", { enumerable: true, get: function () { return types_1.UnauthorizedError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return types_1.ServerError; } });

},{"./Api":2,"./types":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.UnauthorizedError = exports.EndpointNotFoundError = exports.ErrorResponse = void 0;
var ErrorResponse = /** @class */ (function () {
    function ErrorResponse(message, status) {
        this.message = message;
        this.status = status;
    }
    return ErrorResponse;
}());
exports.ErrorResponse = ErrorResponse;
// tslint:disable-next-line: max-classes-per-file
var EndpointNotFoundError = /** @class */ (function () {
    function EndpointNotFoundError(message, status) {
        this.message = message;
        this.status = status;
    }
    return EndpointNotFoundError;
}());
exports.EndpointNotFoundError = EndpointNotFoundError;
// tslint:disable-next-line: max-classes-per-file
var UnauthorizedError = /** @class */ (function () {
    function UnauthorizedError(message, status) {
        this.message = message;
        this.status = status;
    }
    return UnauthorizedError;
}());
exports.UnauthorizedError = UnauthorizedError;
// tslint:disable-next-line: max-classes-per-file
var ServerError = /** @class */ (function () {
    function ServerError(message, status) {
        this.message = message;
        this.status = status;
    }
    return ServerError;
}());
exports.ServerError = ServerError;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tupleListToString = exports.urlFromQueries = exports.pathFromQuery = exports.pathFromQueries = void 0;
var path_1 = require("path");
/**
 * Takes an array of Query objects and returns the path they would represent in a Query API request URL.
 */
var pathFromQueries = function (queries) {
    return path_1.join.apply(void 0, queries.map(exports.pathFromQuery));
};
exports.pathFromQueries = pathFromQueries;
/**
 * Takes a Query and returns the path it would represent in a Query API request URL.
 */
var pathFromQuery = function (query) {
    var parts = ['e', encodeURIComponent(query.endpoint)];
    if (query.parameters) {
        Object.entries(query.parameters).forEach(function (_a) {
            var name = _a[0], value = _a[1];
            parts.push('p', name, encodeURIComponent(value));
        });
    }
    return path_1.join.apply(void 0, parts);
};
exports.pathFromQuery = pathFromQuery;
/**
 * Takes an ApiConfig object and array of Query objects and returns a Query API request URL.
 */
var urlFromQueries = function (config, queries, options, requestType) {
    if (requestType === void 0) { requestType = 'results'; }
    if (!(queries instanceof Array)) {
        queries = [queries];
    }
    if (!config.baseUrl) {
        throw new Error('Base URL missing');
    }
    if (!config.version) {
        throw new Error('Version missing');
    }
    if (!config.workspace) {
        throw new Error('Workspace missing');
    }
    if (!config.api) {
        throw new Error('API name missing');
    }
    // Construct base URL containing Spinque version and workspace
    var url = (0, path_1.join)(config.baseUrl, config.version, config.workspace, 'api', config.api);
    // Add the path represented by the Query objects and request type
    url = (0, path_1.join)(url, (0, exports.pathFromQueries)(queries), requestType);
    // Add config if provided
    if (config.config) {
        url += "?config=".concat(config.config);
    }
    if (options && Object.keys(options).length > 0) {
        Object.entries(options).forEach(function (_a, index) {
            var option = _a[0], value = _a[1];
            if (index === 0 && !config.config) {
                url += '?';
            }
            else {
                url += '&';
            }
            url += "".concat(option, "=").concat(value);
        });
    }
    return url;
};
exports.urlFromQueries = urlFromQueries;
var tupleListToString = function (tuples, scores) {
    var _tuples = ensureTupleList(tuples);
    if (scores && scores.length !== _tuples.length) {
        throw new Error('Scores does not contain as many items as tuples');
    }
    var _scores = scores || Array.from(Array(_tuples.length)).map(function () { return 1; });
    return _tuples
        .map(function (tuple, index) {
        var s = _scores[index];
        var values = tuple.join(',');
        return "".concat(s, "(").concat(values, ")");
    })
        .join('|');
};
exports.tupleListToString = tupleListToString;
var ensureTupleList = function (value) {
    // Convert string or number to nested array
    if (typeof value === 'string' || typeof value === 'number') {
        return [[value]];
    }
    if (!(value instanceof Array)) {
        throw new Error('Tuple list should be of type: (string|number)[][] | (string|number)[] | (string|number)');
    }
    if (value.length === 0) {
        return [[]];
    }
    var someAreArrays = false;
    var allAreArrays = true;
    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
        var t = value_1[_i];
        if (t instanceof Array) {
            someAreArrays = true;
            if (value[0] instanceof Array && t.length !== value[0].length) {
                throw new Error('Tuple list has unequally sized rows (some have more columns)');
            }
        }
        else {
            allAreArrays = false;
        }
    }
    if (someAreArrays && !allAreArrays) {
        throw new Error('Tuple list has unequally sized rows (some are a single value, some arrays)');
    }
    if (!someAreArrays) {
        return value.map(function (v) { return [v]; });
    }
    return value;
};

},{"path":12}],10:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

var isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

var isWebWorker = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
var isJsDom = typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));

var isDeno = typeof Deno !== "undefined" && typeof Deno.core !== "undefined";

exports.isBrowser = isBrowser;
exports.isWebWorker = isWebWorker;
exports.isNode = isNode;
exports.isJsDom = isJsDom;
exports.isDeno = isDeno;
}).call(this)}).call(this,require('_process'))
},{"_process":13}],11:[function(require,module,exports){
var global = typeof self !== 'undefined' ? self : this;
var __self__ = (function () {
function F() {
this.fetch = false;
this.DOMException = global.DOMException
}
F.prototype = global;
return new F();
})();
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
})(__self__);
__self__.fetch.ponyfill = true;
// Remove "polyfill" property added by whatwg-fetch
delete __self__.fetch.polyfill;
// Choose between native implementation (global) or custom implementation (__self__)
// var ctx = global.fetch ? global : __self__;
var ctx = __self__; // this line disable service worker support temporarily
exports = ctx.fetch // To enable: import fetch from 'cross-fetch'
exports.default = ctx.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = ctx.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = ctx.Headers
exports.Request = ctx.Request
exports.Response = ctx.Response
module.exports = exports

},{}],12:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":13}],13:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
