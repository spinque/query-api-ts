(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * To test this demo, you need to build the library, browserify this demo and run a webserver.
 * You also need to have access to a Client ID that accepts the PKCE flow. If you're interested in this,
 * please contact the system administrator at Spinque.
 * 
 * For example:
 *  - npm run build
 *  - cd demo/authentication/browser
 *  - ./browserify.sh
 *  - python -m http.server 4200
 */

const sqa = require("@spinque/query-api");

async function main() {
  const apiWithAuth = new sqa.Api({
    workspace: 'course-main',
    api: 'movies',
    authentication: {
      type: 'pkce',
      clientId: '9xa3MpWBCeG72XCohLIYAVigdiL00OvO',
      callback: 'http://localhost:4200'
    },
    tokenCache: sqa.localStorageTokenCache
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
},{"@spinque/query-api":9}],2:[function(require,module,exports){
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
// This is the default base URL to the Spinque Query API.
var DEFAULT_BASE_URL = 'https://rest.spinque.com/';
/**
 * Send queries to the Spinque Query API using fetch.
 */
var Api = /** @class */ (function () {
    function Api(apiConfig) {
        /**
         * URL to the Spinque Query API deployment.
         *
         * @default https://rest.spinque.com/
         */
        this.baseUrl = DEFAULT_BASE_URL;
        /**
         * Version of the Spinque Query API deployment.
         *
         * @default 4
         */
        this.version = '4';
        /**
         * Name of the configuration of the Spinque workspace that should be used.
         * Usually, this is something like 'production', 'development' or 'default'.
         * The Spinque Desk administrator working on your project knowns this value.
         *
         * @default default
         */
        this.config = 'default';
        if (apiConfig && apiConfig.baseUrl) {
            this.baseUrl = apiConfig.baseUrl;
        }
        if (apiConfig && apiConfig.version) {
            this.version = apiConfig.version;
        }
        if (apiConfig && apiConfig.workspace) {
            this.workspace = apiConfig.workspace;
        }
        if (apiConfig && apiConfig.api) {
            this.api = apiConfig.api;
        }
        if (apiConfig && apiConfig.config) {
            this.config = apiConfig.config;
        }
        if (apiConfig && apiConfig.authentication) {
            if (apiConfig.authentication.type === 'client-credentials') {
                this._authentication = apiConfig.authentication;
                this._authenticator = new authentication_1.ClientCredentials(apiConfig.authentication.clientId, apiConfig.authentication.clientSecret, apiConfig.authentication.authServer, apiConfig.authentication.tokenCachePath, apiConfig.baseUrl || DEFAULT_BASE_URL);
            }
            if (apiConfig.authentication.type === 'pkce') {
                this._authentication = apiConfig.authentication;
                this._authenticator = new authentication_1.PKCE(apiConfig.authentication.clientId, apiConfig.authentication.callback, apiConfig.authentication.authServer, apiConfig.baseUrl || DEFAULT_BASE_URL);
            }
        }
    }
    Object.defineProperty(Api.prototype, "accessToken", {
        get: function () {
            var _a;
            return (_a = this._authenticator) === null || _a === void 0 ? void 0 : _a._accessToken;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "authentication", {
        /**
         * Getter for authentication configuration
         */
        get: function () {
            return this._authentication;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Api.prototype, "apiConfig", {
        /**
         * Getter for authentication configuration
         */
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
                        // Convert single query to array of queries
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
                    return [2 /*return*/, (0, cross_fetch_1.default)(url, requestInit).then(function (res) { return _this.handleResponse(res); })];
                }
            });
        });
    };
    /**
     * Handle the response of a fetch to Spinque Query API.
     */
    Api.prototype.handleResponse = function (response) {
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

},{"./authentication":7,"./types":10,"./utils":11,"cross-fetch":14}],3:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacetedSearch = exports.FacetType = void 0;
var utils_1 = require("./utils");
var FacetType;
(function (FacetType) {
    FacetType["single"] = "single";
    FacetType["multiple"] = "multiple";
})(FacetType = exports.FacetType || (exports.FacetType = {}));
/**
 * Associate Query objects with each other in a faceted search setup.
 */
var FacetedSearch = /** @class */ (function () {
    function FacetedSearch(
    // Query object for the search results that will serve as the base for this facet.
    // The searchQuery is used to fetch the options of the facet and will be filtered once
    // one or more facet options are selected.
    // The searchQuery must have at least one parameter.
    searchQuery, 
    // emptyParameterQuery is used instead of searchQuery when the searchQuery parameters are all empty.
    // If no emptyParameterQuery is passed, searchQuery is fetched with empty parameters.
    emptyParameterQuery, modifiers) {
        this.searchQuery = searchQuery;
        this.emptyParameterQuery = emptyParameterQuery;
        this.modifiers = modifiers;
        // Internal list of Facet objects
        this._facets = [];
        // Throw an error if the searchQuery does not have parameters
        if (!searchQuery.parameters || Object.keys(searchQuery.parameters).length === 0) {
            throw new Error('searchQuery has no parameters. Please initialize with an empty parameter');
        }
        if (modifiers) {
            this._modifiers = modifiers;
        }
    }
    /**
     * Add a facet to the FacetedSearch object.
     */
    FacetedSearch.prototype.addFacet = function (endpoint, type, resetOnQueryChange, filterEndpointPostfix, filterEndpointParameterName) {
        if (type === void 0) { type = FacetType.single; }
        if (resetOnQueryChange === void 0) { resetOnQueryChange = true; }
        if (filterEndpointPostfix === void 0) { filterEndpointPostfix = ':FILTER'; }
        if (filterEndpointParameterName === void 0) { filterEndpointParameterName = 'value'; }
        this._facets.push({
            optionsEndpoint: endpoint,
            filterEndpoint: "".concat(endpoint).concat(filterEndpointPostfix),
            filterParameterName: filterEndpointParameterName,
            filterParameterValue: undefined,
            resetOnQueryChange: resetOnQueryChange,
            type: type,
        });
    };
    Object.defineProperty(FacetedSearch.prototype, "facets", {
        get: function () {
            return this._facets;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set a query as modifier. Only modifiers in the list passed to constructor are allowed.
     */
    FacetedSearch.prototype.setModifier = function (modifier) {
        if (modifier === undefined) {
            this._activeModifier = undefined;
        }
        else if (this._modifiers) {
            var allowed = this._modifiers.find(function (m) { return m.endpoint === (modifier === null || modifier === void 0 ? void 0 : modifier.endpoint); });
            if (!allowed) {
                return;
            }
            this._activeModifier = modifier;
        }
    };
    /**
     * Get the currently active modifier query.
     */
    FacetedSearch.prototype.getModifier = function () {
        return this._activeModifier;
    };
    /**
     * Get the Query to get the search results.
     * Will return searchQuery as passed to the constructor unless a emptyParameterQuery was
     * also passed and all parameters for searchQuery are empty.
     */
    FacetedSearch.prototype.getBaseQuery = function () {
        if (this.emptyParameterQuery &&
            (!this.searchQuery.parameters ||
                Object.keys(this.searchQuery.parameters).length === 0 ||
                Object.values(this.searchQuery.parameters).every(function (p) { return !p || p === ''; }))) {
            return this.emptyParameterQuery;
        }
        else {
            return this.searchQuery;
        }
    };
    /**
     * Get the Query objects to retrieve search results. This includes the facet Query, if applicable.
     */
    FacetedSearch.prototype.getResultsQuery = function () {
        var q = __spreadArray([
            this.getBaseQuery()
        ], __read(this._facets
            .filter(function (f) { return f.filterParameterValue !== undefined && f.filterParameterValue !== ''; })
            .map(function (f) {
            var _a;
            return ({
                endpoint: f.filterEndpoint,
                parameters: (_a = {}, _a[f.filterParameterName] = f.filterParameterValue, _a),
            });
        })), false);
        if (this._activeModifier !== undefined && this._activeModifier !== null) {
            q.push(this._activeModifier);
        }
        return q;
    };
    /**
     * Get the Query objects to retrieve the facet options. When using multiple facets, the facetEndpoint
     * parameter is required.
     */
    FacetedSearch.prototype.getFacetQuery = function (facetEndpoint) {
        var facet = this._facets.find(function (f) { return f.optionsEndpoint === facetEndpoint; });
        if (!facet) {
            throw new Error('Facet not found in FacetedSearch');
        }
        return __spreadArray(__spreadArray([
            this.getBaseQuery()
        ], __read(this._facets
            .filter(function (f) {
            return f.filterParameterValue !== undefined &&
                f.filterParameterValue !== '' &&
                f.optionsEndpoint !== facetEndpoint;
        })
            .map(function (f) {
            var _a;
            return ({
                endpoint: f.filterEndpoint,
                parameters: (_a = {}, _a[f.filterParameterName] = f.filterParameterValue, _a),
            });
        })), false), [
            { endpoint: facet.optionsEndpoint },
        ], false);
    };
    /**
     * Set a parameter value for the searchQuery
     */
    FacetedSearch.prototype.setParameter = function (name, value) {
        var _a;
        this.searchQuery = __assign(__assign({}, this.searchQuery), { parameters: __assign(__assign({}, this.searchQuery.parameters), (_a = {}, _a[name] = value, _a)) });
        this._facets.forEach(function (f) {
            if (f.resetOnQueryChange) {
                f.filterParameterValue = undefined;
            }
        });
    };
    /**
     * Clear all searchQuery parameters
     */
    FacetedSearch.prototype.clearParameters = function () {
        this.searchQuery = __assign(__assign({}, this.searchQuery), { parameters: Object.keys(this.searchQuery.parameters || {}).reduce(function (acc, cur) {
                var _a;
                return (__assign(__assign({}, acc), (_a = {}, _a[cur] = '', _a)));
            }, {}) });
    };
    /**
     * Set the selected options for a given facet.
     */
    FacetedSearch.prototype.setFacetSelection = function (facetEndpoint, selection) {
        if (!(selection instanceof Array)) {
            selection = [selection];
        }
        var facet = this._facets.find(function (f) { return f.optionsEndpoint === facetEndpoint; });
        if (!facet) {
            throw new Error("FacetedSearch does not contain facet ".concat(facetEndpoint));
        }
        if (selection.length === 0) {
            facet.filterParameterValue = undefined;
        }
        else if (facet.type === 'single') {
            if (selection.length > 1) {
                throw new Error("Facet ".concat(facetEndpoint, " is a single selection facet but more than one selected option was given."));
            }
            facet.filterParameterValue = selection[0];
        }
        else {
            facet.filterParameterValue = (0, utils_1.tupleListToString)(selection);
        }
    };
    /**
     * Clear the selection for a given facet.
     */
    FacetedSearch.prototype.clearFacetSelection = function (facetEndpoint) {
        if (facetEndpoint) {
            var facet = this._facets.find(function (f) { return f.optionsEndpoint === facetEndpoint; });
            if (!facet) {
                throw new Error("FacetedSearch does not contain facet ".concat(facetEndpoint));
            }
            facet.filterParameterValue = '';
        }
        else {
            this._facets.forEach(function (f) {
                f.filterParameterValue = '';
            });
        }
    };
    FacetedSearch.prototype.setSearchQuery = function (query) {
        this.searchQuery = query;
    };
    return FacetedSearch;
}());
exports.FacetedSearch = FacetedSearch;

},{"./utils":11}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = exports.DEFAULT_AUDIENCE = exports.DEFAULT_AUTH_SERVER = void 0;
var browser_or_node_1 = require("browser-or-node");
var fs = require("fs");
exports.DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';
exports.DEFAULT_AUDIENCE = 'https://rest.spinque.com/';
/**
 * Abstract class with utitily functions for working with access tokens such as storage
 */
var Authenticator = /** @class */ (function () {
    function Authenticator(_tokenCachePath) {
        var _this = this;
        this._tokenCachePath = _tokenCachePath;
        this._authInProgress = true;
        /**
         * A Promise that delays any operation until an access token is set (with intervals of 50ms)
         * This is used to delay incoming request from our app when an access token is already
         * being requested but has not yet been received.
         */
        this._waitForAccessToken = new Promise(function (resolve) {
            var wait = function () {
                setTimeout(function () { return (!_this._authInProgress && _this._accessToken ? resolve(_this._accessToken) : wait()); }, 50);
            };
            wait();
        });
        // First thing to do: check if there's an access token in localStorage
        var res = this.getFromStorage();
        if (res) {
            // Set it as class property
            this._accessToken = res.accessToken;
            this._expires = res.expires;
            this._authInProgress = false;
        }
        else {
            this._authInProgress = false;
        }
    }
    Object.defineProperty(Authenticator.prototype, "accessToken", {
        /**
         * Promise that will resolve with an access token if available or undefined otherwise.
         * This will try to fetch a new access token if:
         *  - the class implements the fetchAccessToken method
         *  - no unexpired access token is stored in this class
         */
        get: function () {
            var _this = this;
            // If the class already stores an access token, return it
            if (this._accessToken && this._expires && this._expires > Date.now() + 1000) {
                return Promise.resolve(this._accessToken);
            }
            // If the class is already authenticating, wait for it
            if (this._authInProgress) {
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
    /**
     * Puts an access token and the expiration time in storage for usage when calling Spinque Query API
     */
    Authenticator.prototype.setAccessToken = function (accessToken, expiresIn) {
        this._accessToken = accessToken;
        this._expires = Date.now() + expiresIn * 1000;
        this.putInStorage(this._accessToken, this._expires);
        this._authInProgress = false;
    };
    Authenticator.prototype.putInStorage = function (accessToken, expires) {
        if (browser_or_node_1.isBrowser && !!localStorage) {
            // TODO: configure keys
            localStorage.setItem('@spinque/query-api/access-token', accessToken);
            localStorage.setItem('@spinque/query-api/expires', "".concat(expires));
        }
        if (!browser_or_node_1.isBrowser && this._tokenCachePath) {
            var json = JSON.stringify({ accessToken: accessToken, expires: expires });
            fs.writeFileSync(this._tokenCachePath, json);
        }
    };
    /**
     * Get an access token from storage (if available)
     */
    Authenticator.prototype.getFromStorage = function () {
        // Localstorage is only available for browser applications
        if (browser_or_node_1.isBrowser) {
            return this.getFromBrowserLocalStorage();
        }
        if (!browser_or_node_1.isBrowser && this._tokenCachePath) {
            return this.getFromFileStorage(this._tokenCachePath);
        }
        return null;
    };
    Authenticator.prototype.getFromBrowserLocalStorage = function () {
        if (!localStorage) {
            return null;
        }
        try {
            var accessToken = localStorage.getItem('@spinque/query-api/access-token');
            var expires = parseInt(localStorage.getItem('@spinque/query-api/expires') || '', 10);
            if (accessToken && expires && expires > Date.now() + 1000) {
                return { accessToken: accessToken, expires: expires };
            }
            else {
                localStorage.removeItem('@spinque/query-api/access-token');
                localStorage.removeItem('@spinque/query-api/expires');
                return null;
            }
        }
        catch (error) {
            return null;
        }
    };
    Authenticator.prototype.getFromFileStorage = function (path) {
        try {
            var data = fs.readFileSync(path, { encoding: 'utf8' });
            var _a = JSON.parse(data), accessToken = _a.accessToken, expires = _a.expires;
            if (typeof accessToken !== 'string' && typeof expires !== 'number') {
                // TODO: delete file
                return null;
            }
            return { accessToken: accessToken, expires: expires };
        }
        catch (error) {
            return null;
        }
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;

},{"browser-or-node":12,"fs":13}],5:[function(require,module,exports){
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCredentials = void 0;
var Authenticator_1 = require("./Authenticator");
var utils_1 = require("../utils");
var browser_or_node_1 = require("browser-or-node");
var cross_fetch_1 = require("cross-fetch");
/**
 * An Authenticator class for the OAuth 2.0 Client Credentials grant.
 */
var ClientCredentials = /** @class */ (function (_super) {
    __extends(ClientCredentials, _super);
    function ClientCredentials(
    // Client ID from Spinque Desk > Settings > Team Members > System-to-System account
    clientId, 
    // Client Secret from Spinque Desk > Settings > Team Members > System-to-System account
    clientSecret, 
    // URL to the Spinque Authorization server, default is https://login.spinque.com/
    authServer, 
    // Optional path to store the authentication token and make it persistent through server restarts
    tokenCachePath, 
    // URL to the Spinque Query API, used as OAuth 2.0 scope, default is https://rest.spinque.com/
    baseUrl) {
        var _this = _super.call(this, tokenCachePath) || this;
        _this.clientId = clientId;
        _this.clientSecret = clientSecret;
        _this.authServer = authServer;
        _this.tokenCachePath = tokenCachePath;
        _this.baseUrl = baseUrl;
        if (browser_or_node_1.isBrowser) {
            throw new Error('The Client Credentials Flow is only allowed for server applications.');
        }
        return _this;
    }
    /**
     * This method fetches an access token using the OAuth 2.0 Client Credentials grant and returns it
     */
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
                        return [4 /*yield*/, (0, cross_fetch_1.default)((0, utils_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new cross_fetch_1.Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
                                // URL Encode the body
                                body: Object.entries(body)
                                    .map(function (_a) {
                                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
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
                                expiresIn: json.expires_in,
                            }];
                }
            });
        });
    };
    return ClientCredentials;
}(Authenticator_1.Authenticator));
exports.ClientCredentials = ClientCredentials;

},{"../utils":11,"./Authenticator":4,"browser-or-node":12,"cross-fetch":14}],6:[function(require,module,exports){
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToBase64UrlEncoded = exports.sha256 = exports.createRandomString = exports.getCryptoSubtle = exports.getCrypto = exports.PKCE = void 0;
var Authenticator_1 = require("./Authenticator");
var utils_1 = require("../utils");
var browser_or_node_1 = require("browser-or-node");
var cross_fetch_1 = require("cross-fetch");
/**
 * An Authenticator class for the OAuth 2.0 Authorization Code with PKCE grant.
 */
var PKCE = /** @class */ (function (_super) {
    __extends(PKCE, _super);
    function PKCE(
    // Client ID for your application, can be generated by an Spinque system administrator upon request.
    clientId, 
    // The callback URL to your application, this must be known by the Spinque Authorization server, contact system administrator if this changes.
    callback, 
    // URL to the Spinque Authorization server, default is https://login.spinque.com/
    authServer, 
    // URL to the Spinque Query API, used as OAuth 2.0 scope, default is https://rest.spinque.com/
    baseUrl) {
        var _this = _super.call(this) || this;
        _this.clientId = clientId;
        _this.callback = callback;
        _this.authServer = authServer;
        _this.baseUrl = baseUrl;
        if (!browser_or_node_1.isBrowser) {
            throw new Error('PKCE is only available for browser applications');
        }
        // Immediately check whether we're on the callback page
        _this.checkForCallback();
        return _this;
    }
    PKCE.prototype.checkForCallback = function () {
        var _this = this;
        if (!window || !window.location) {
            throw new Error('Cannot retrieve current location to check authentication callback');
        }
        // TODO: should check if domain and path match callback URL, not just get query params
        // Get query parameters from URL
        var params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (!params['code'] || !params['state']) {
            return;
        }
        this._authInProgress = true;
        this.tradeCodeForToken(params['code'], params['state']).catch(function () { return _this.authorize(); });
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
            var authServer, audience, verifier, challenge, _a, state, params, authorizationUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authServer = this.authServer || Authenticator_1.DEFAULT_AUTH_SERVER;
                        audience = this.baseUrl || Authenticator_1.DEFAULT_AUDIENCE;
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
                            audience: audience,
                            scope: '',
                            state: state,
                        };
                        authorizationUrl = (0, utils_1.join)(authServer, 'authorize');
                        authorizationUrl += "?".concat(Object.entries(params)
                            .map(function (_a) {
                            var _b = __read(_a, 2), key = _b[0], value = _b[1];
                            return "".concat(key, "=").concat(value);
                        })
                            .join('&'));
                        window.location.href = authorizationUrl;
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
                            code: code,
                        };
                        return [4 /*yield*/, (0, cross_fetch_1.default)((0, utils_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new cross_fetch_1.Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
                                body: Object.entries(body)
                                    .map(function (_a) {
                                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
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
    return urlEncodeB64(window.btoa(String.fromCharCode.apply(String, __spreadArray([], __read(Array.from(ie11SafeInput)), false))));
};
exports.bufferToBase64UrlEncoded = bufferToBase64UrlEncoded;
var urlEncodeB64 = function (input) {
    var b64Chars = { '+': '-', '/': '_', '=': '' };
    return input.replace(/[+/=]/g, function (m) { return b64Chars[m]; });
};

},{"../utils":11,"./Authenticator":4,"browser-or-node":12,"cross-fetch":14}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PKCE = exports.ClientCredentials = exports.Authenticator = void 0;
var Authenticator_1 = require("./Authenticator");
Object.defineProperty(exports, "Authenticator", { enumerable: true, get: function () { return Authenticator_1.Authenticator; } });
var ClientCredentials_1 = require("./ClientCredentials");
Object.defineProperty(exports, "ClientCredentials", { enumerable: true, get: function () { return ClientCredentials_1.ClientCredentials; } });
var PKCE_1 = require("./PKCE");
Object.defineProperty(exports, "PKCE", { enumerable: true, get: function () { return PKCE_1.PKCE; } });

},{"./Authenticator":4,"./ClientCredentials":5,"./PKCE":6}],8:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCluster = exports.getClusters = void 0;
var utils_1 = require("./utils");
var DEFAULT_CLUSTER_ENDPOINT = 'type:FILTER';
var DEFAULT_CLUSTER_PARAMETER_NAME = 'value';
var DEFAULT_CLUSTER_PARAMETER_TYPE = 'TUPLE_LIST';
var RDFS_CLASS = 'http://www.w3.org/2000/01/rdf-schema#Class';
/**
 * Taskes a ResultsResponse, finds clusters in the results and returns a list of Cluster objects.
 * These Cluster objects contain a Query that can be used to fetch the contents of the clusters
 * by stacking the Query on top of the results Query[].
 */
var getClusters = function (results, options) {
    var e_1, _a, _b;
    var _c, _d, _e;
    if (options === void 0) { options = {}; }
    var endpoint = (_c = options.clusterEndpoint) !== null && _c !== void 0 ? _c : DEFAULT_CLUSTER_ENDPOINT;
    var parameterName = (_d = options.clusterParameterName) !== null && _d !== void 0 ? _d : DEFAULT_CLUSTER_PARAMETER_NAME;
    var parameterType = (_e = options.clusterParameterType) !== null && _e !== void 0 ? _e : DEFAULT_CLUSTER_PARAMETER_TYPE;
    var clusters = [];
    try {
        // Loop through result items and when encountering a cluster, add it to the list
        for (var _f = __values(results.items), _g = _f.next(); !_g.done; _g = _f.next()) {
            var item = _g.value;
            if (!(0, exports.isCluster)(item)) {
                continue;
            }
            var cluster = {
                probability: item.probability,
                rank: item.rank,
                class: item.tuple[0].class,
                query: {
                    endpoint: endpoint,
                    parameters: (_b = {},
                        _b[parameterName] = parameterType === 'TUPLE_LIST' ? (0, utils_1.tupleListToString)([item.tuple[0].id]) : item.tuple[0].id,
                        _b),
                },
            };
            clusters.push(cluster);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return clusters;
};
exports.getClusters = getClusters;
/**
 * Takes a result item and checks if it is a cluster.
 * A result is considered a cluster when it's of type rdfs:Class.
 */
var isCluster = function (item) {
    if (!item.tuple ||
        item.tuple.length !== 1 ||
        typeof item.tuple[0] === 'string' ||
        typeof item.tuple[0] === 'number') {
        return false;
    }
    return item.tuple[0].class.includes(RDFS_CLASS);
};
exports.isCluster = isCluster;

},{"./utils":11}],9:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Api"), exports);
__exportStar(require("./authentication"), exports);
__exportStar(require("./FacetedSearch"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./clusters"), exports);

},{"./Api":2,"./FacetedSearch":3,"./authentication":7,"./clusters":8,"./types":10,"./utils":11}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.UnauthorizedError = exports.EndpointNotFoundError = exports.ErrorResponse = void 0;
/**
 * Generic error response class. Is implemented by more specific error type classes.
 */
var ErrorResponse = /** @class */ (function () {
    function ErrorResponse(message, status) {
        this.message = message;
        this.status = status;
    }
    return ErrorResponse;
}());
exports.ErrorResponse = ErrorResponse;
/**
 * Error class used when Spinque cannot find the endpoint you requested.
 * The endpoint might be misspelled or removed.
 */
var EndpointNotFoundError = /** @class */ (function () {
    function EndpointNotFoundError(message, status) {
        this.message = message;
        this.status = status;
    }
    return EndpointNotFoundError;
}());
exports.EndpointNotFoundError = EndpointNotFoundError;
/**
 * Error class used when you are not authorized to request results for
 * this workspace, API or endpoint.
 */
var UnauthorizedError = /** @class */ (function () {
    function UnauthorizedError(message, status) {
        this.message = message;
        this.status = status;
    }
    return UnauthorizedError;
}());
exports.UnauthorizedError = UnauthorizedError;
/**
 * Error class when something fails on the side of Spinque. Please contact
 * your system administrator when this happens.
 */
var ServerError = /** @class */ (function () {
    function ServerError(message, status) {
        this.message = message;
        this.status = status;
    }
    return ServerError;
}());
exports.ServerError = ServerError;

},{}],11:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyQueries = exports.parseQueries = exports.join = exports.tupleListToString = exports.stringToTupleList = exports.urlFromQueries = exports.pathFromQuery = exports.pathFromQueries = void 0;
/**
 * Takes an array of Query objects and returns the path they would represent in a Query API request URL.
 */
var pathFromQueries = function (queries) {
    return exports.join.apply(void 0, __spreadArray([], __read(queries.map(exports.pathFromQuery)), false));
};
exports.pathFromQueries = pathFromQueries;
/**
 * Takes a Query and returns the path it would represent in a Query API request URL.
 */
var pathFromQuery = function (query) {
    var parts = ['e', encodeURIComponent(query.endpoint)];
    if (query.parameters) {
        Object.entries(query.parameters).forEach(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            parts.push('p', encodeURIComponent(name), encodeURIComponent(value));
        });
    }
    return exports.join.apply(void 0, __spreadArray([], __read(parts), false));
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
    var url = config.baseUrl;
    if (!url.endsWith('/')) {
        url += '/';
    }
    // Construct base URL containing Spinque version and workspace
    url += (0, exports.join)(config.version, config.workspace, 'api', config.api);
    // Add the path represented by the Query objects and request type
    url += '/' + (0, exports.join)((0, exports.pathFromQueries)(queries), requestType);
    // Add config if provided
    if (config.config) {
        url += "?config=".concat(config.config);
    }
    if (options && Object.keys(options).length > 0) {
        Object.entries(options).forEach(function (_a, index) {
            var _b = __read(_a, 2), option = _b[0], value = _b[1];
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
/**
 * Given a tuple list (and optionally scores), return a string representation.
 */
var stringToTupleList = function (value) {
    try {
        return value.split('|').reduce(function (acc, cur) {
            var score = parseFloat(cur.split('(')[0]);
            var tuples = cur.split('(')[1].split(')')[0].split(',');
            acc.scores.push(score);
            acc.tuples.push(tuples);
            return acc;
        }, { scores: [], tuples: [] });
    }
    catch (error) {
        return null;
    }
};
exports.stringToTupleList = stringToTupleList;
/**
 * Given a string, try to parse as tuple list.
 */
var tupleListToString = function (
// tuples can be either a string, a number, an array of strings or numbers,
// or an array of arrays of strings or numbers
tuples, scores) {
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
/**
 * Takes a value that should be a tuple list and ensures it has a normalized form.
 */
var ensureTupleList = function (value) {
    var e_1, _a;
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
    try {
        for (var value_1 = __values(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
            var t = value_1_1.value;
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
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (value_1_1 && !value_1_1.done && (_a = value_1.return)) _a.call(value_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (someAreArrays && !allAreArrays) {
        throw new Error('Tuple list has unequally sized rows (some are a single value, some arrays)');
    }
    if (!someAreArrays) {
        return value.map(function (v) { return [v]; });
    }
    return value;
};
/**
 * Joins together URL parts into an URL
 */
var join = function () {
    var e_2, _a;
    var segments = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        segments[_i] = arguments[_i];
    }
    var parts = segments.reduce(function (_parts, segment) {
        // Remove leading slashes from non-first part.
        if (_parts.length > 0) {
            segment = segment.replace(/^\//, '');
        }
        // Remove trailing slashes.
        segment = segment.replace(/\/$/, '');
        return _parts.concat(segment.split('/'));
    }, []);
    var resultParts = [];
    try {
        for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
            var part = parts_1_1.value;
            if (part === '.') {
                continue;
            }
            if (part === '..') {
                resultParts.pop();
                continue;
            }
            resultParts.push(part);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return resultParts.join('/');
};
exports.join = join;
/**
 * Expects a string generated by stringifyQueries and returns an array of Query's
 */
var parseQueries = function (stringified) {
    if (!stringified) {
        return [];
    }
    try {
        var endpoints = JSON.parse(stringified);
        return endpoints.map(function (e) {
            if (typeof e === 'string') {
                return {
                    endpoint: e,
                    parameters: undefined,
                };
            }
            else {
                return {
                    endpoint: e[0],
                    parameters: e[1],
                };
            }
        });
    }
    catch (error) {
        return [];
    }
};
exports.parseQueries = parseQueries;
/**
 * Expects an array of Query's and turns them into a string
 */
var stringifyQueries = function (queries) {
    var endpointString = queries.map(function (q) { return (q.parameters ? [q.endpoint, q.parameters] : q.endpoint); });
    return JSON.stringify(endpointString);
};
exports.stringifyQueries = stringifyQueries;

},{}],12:[function(require,module,exports){
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

var isDeno = typeof Deno !== "undefined" && typeof Deno.version !== "undefined" && typeof Deno.version.deno !== "undefined";

exports.isBrowser = isBrowser;
exports.isWebWorker = isWebWorker;
exports.isNode = isNode;
exports.isJsDom = isJsDom;
exports.isDeno = isDeno;
}).call(this)}).call(this,require('_process'))
},{"_process":15}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
