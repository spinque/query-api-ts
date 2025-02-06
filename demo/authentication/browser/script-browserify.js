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

const sqa = require("../../../dist");

async function main() {
  const apiWithAuth = new sqa.Api({
    workspace: 'course-main',
    api: 'movies',
    authentication: {
      type: 'pkce',
      clientId: '9xa3MpWBCeG72XCohLIYAVigdiL00OvO',
      callback: 'http://localhost:4200',
      tokenCache: sqa.localStorageTokenCache
    }
  });

  const queries = [{
    endpoint: 'movie',
    parameters: { id: 'https://imdb.com/data/movie/tt0209144' }
  }];

  // Fetch response (or get URL and use your own HTTP library)
  const response = await apiWithAuth.fetch(queries, { count: 10, offset: 0 });

  console.log(response);
  // alert('Check the console for the results');
}

main();
},{"../../../dist":10}],2:[function(require,module,exports){
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
exports.Api = exports.DEFAULT_BASE_URL = void 0;
var authentication_1 = require("./authentication");
var types_1 = require("./types");
var utils_1 = require("./utils");
// This is the default base URL to the Spinque Query API.
exports.DEFAULT_BASE_URL = 'https://rest.spinque.com/';
/**
 * Send queries to the Spinque Query API using fetch.
 */
var Api = /** @class */ (function () {
    function Api(apiConfig) {
        var _this = this;
        /**
         * URL to the Spinque Query API deployment.
         *
         * @default https://rest.spinque.com/
         */
        this.baseUrl = exports.DEFAULT_BASE_URL;
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
                this._authenticator = new authentication_1.ClientCredentials(apiConfig.authentication.clientId, apiConfig.authentication.clientSecret, apiConfig.authentication.tokenCache, apiConfig.authentication.authServer, apiConfig.baseUrl);
            }
            if (apiConfig.authentication.type === 'pkce') {
                this._authentication = apiConfig.authentication;
                this._authenticator = new authentication_1.PKCE(apiConfig.authentication.clientId, apiConfig.authentication.callback, apiConfig.authentication.authServer, apiConfig.authentication.tokenCache, apiConfig.baseUrl);
            }
        }
        // If auth is configured but there is not token yet..
        if ((apiConfig === null || apiConfig === void 0 ? void 0 : apiConfig.authentication) && (!apiConfig.authentication.tokenCache || !apiConfig.authentication.tokenCache.get())) {
            console.log(apiConfig.authentication.tokenCache);
            // Request the API information to see if auth is actually needed
            var url = (0, utils_1.apiUrl)(this.apiConfig);
            // Save the status in _isInitialized to delay incoming fetch requests until we know if auth is needed
            this._isInitialized = fetch(url).then(function (res) {
                var _a;
                if (res.status === 200 || !_this._authenticator) {
                    // If this is allowed without authentication, we can forget about the auth confug
                    _this._authentication = undefined;
                    return new Promise(function (resolve) { return resolve(true); });
                }
                else {
                    // If this is not allowed, request an access token
                    return (_a = _this._authenticator) === null || _a === void 0 ? void 0 : _a.accessToken.then(function () { return true; });
                }
            });
        }
        else {
            this._isInitialized = new Promise(function (resolve) { return resolve(true); });
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
    /**
     * Fetch a Query (or array of Queries). Takes optional RequestOptions and RequestType into account.
     * Optionally the `fetch` RequestInit can be passed.
     */
    Api.prototype.fetch = function (queries, options, requestType, requestInit) {
        if (requestInit === void 0) { requestInit = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var url, token;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._isInitialized];
                    case 1:
                        _a.sent();
                        // Convert single query to array of queries
                        if (!(queries instanceof Array)) {
                            queries = [queries];
                        }
                        if (queries.length === 0) {
                            throw new Error('Queries array is empty');
                        }
                        url = (0, utils_1.urlFromQueries)(this.apiConfig, queries, options, requestType);
                        if (!(this.authentication && this._authenticator)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._authenticator.accessToken];
                    case 2:
                        token = _a.sent();
                        requestInit = { headers: new Headers(__assign(__assign({}, requestInit.headers), { Authorization: "Bearer ".concat(token) })) };
                        _a.label = 3;
                    case 3: 
                    // Make the request
                    return [2 /*return*/, fetch(url, requestInit).then(function (res) { return _this.handleResponse(res); })];
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
                        if (response.status === 400 && json.message.includes('no endpoint')) {
                            throw new types_1.EndpointNotFoundError(json.message, 400);
                        }
                        if (response.status === 500) {
                            throw new types_1.ServerError(json.message, 401);
                        }
                        if (response.status === 404 && json.message.includes('No such api')) {
                            throw new types_1.ApiNotFoundError(json.message, 404);
                        }
                        if (response.status === 404 && json.message.includes('No such workspace configuration')) {
                            throw new types_1.WorkspaceConfigNotFoundError(json.message, 404);
                        }
                        throw new types_1.ErrorResponse('Unknown error: ' + (json.message || ''), response.status);
                }
            });
        });
    };
    return Api;
}());
exports.Api = Api;

},{"./authentication":8,"./types":11,"./utils":12}],3:[function(require,module,exports){
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
    FacetedSearch.prototype.getResultsQuery = function (excludeModifier) {
        if (excludeModifier === void 0) { excludeModifier = false; }
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
        if (!excludeModifier && this._activeModifier !== undefined && this._activeModifier !== null) {
            q.push(this._activeModifier);
        }
        return q;
    };
    /**
     * Get the Query objects to retrieve the facet options. When using multiple facets, the facetEndpoint
     * parameter is required.
     */
    FacetedSearch.prototype.getFacetQuery = function (facetEndpoint, excludeModifier) {
        if (excludeModifier === void 0) { excludeModifier = false; }
        var facet = this._facets.find(function (f) { return f.optionsEndpoint === facetEndpoint; });
        if (!facet) {
            throw new Error('Facet not found in FacetedSearch');
        }
        var q = __spreadArray([
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
        })), false);
        if (!excludeModifier && this._activeModifier !== undefined && this._activeModifier !== null) {
            q.push(this._activeModifier);
        }
        q.push({ endpoint: facet.optionsEndpoint });
        return q;
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

},{"./utils":12}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = exports.DEFAULT_AUDIENCE = exports.DEFAULT_AUTH_SERVER = void 0;
exports.DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';
exports.DEFAULT_AUDIENCE = 'https://rest.spinque.com/';
/**
 * Abstract class with utitily functions for working with access tokens such as storage
 */
var Authenticator = /** @class */ (function () {
    function Authenticator(_tokenCache) {
        var _this = this;
        this._tokenCache = _tokenCache;
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
        var cachedToken = this._tokenCache.get();
        if (cachedToken) {
            // Set it as class property
            this._accessToken = cachedToken.accessToken;
            this._expires = cachedToken.expires;
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
        this._tokenCache.set(this._accessToken, this._expires);
        this._authInProgress = false;
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;

},{}],5:[function(require,module,exports){
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
var index_1 = require("./index");
var utils_1 = require("../utils");
var utils_2 = require("../utils");
var __1 = require("..");
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
    // Optional path to store the authentication token and make it persistent through server restarts
    tokenCache, 
    // URL to the Spinque Authorization server, default is https://login.spinque.com/
    authServer, 
    // URL to the Spinque Query API, used as OAuth 2.0 scope, default is https://rest.spinque.com/
    baseUrl) {
        if (authServer === void 0) { authServer = index_1.DEFAULT_AUTH_SERVER; }
        if (baseUrl === void 0) { baseUrl = __1.DEFAULT_BASE_URL; }
        var _this = this;
        if (utils_2.isBrowser) {
            throw new Error('The Client Credentials Flow is only allowed for server applications.');
        }
        if (!tokenCache) {
            console.warn("Please supply a TokenCache instance to cache the access token. See the README of @spinque/query-api for more details.");
            tokenCache = { get: function () { return null; }, set: function () { } };
        }
        _this = _super.call(this, tokenCache) || this;
        _this.clientId = clientId;
        _this.clientSecret = clientSecret;
        _this.authServer = authServer;
        _this.baseUrl = baseUrl;
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
                        authServer = this.authServer || index_1.DEFAULT_AUTH_SERVER;
                        body = {
                            grant_type: 'client_credentials',
                            client_id: this.clientId,
                            client_secret: this.clientSecret,
                            audience: this.baseUrl,
                        };
                        return [4 /*yield*/, fetch((0, utils_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
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
}(index_1.Authenticator));
exports.ClientCredentials = ClientCredentials;

},{"..":10,"../utils":12,"./index":8}],6:[function(require,module,exports){
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
var _1 = require("./");
var utils_1 = require("../utils");
var utils_2 = require("../utils");
var TokenCache_1 = require("./TokenCache");
var __1 = require("..");
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
    // Optional path to store the authentication token and make it persistent through server/page reloads
    tokenCache, 
    // URL to the Spinque Query API, used as OAuth 2.0 scope, default is https://rest.spinque.com/
    baseUrl) {
        if (tokenCache === void 0) { tokenCache = TokenCache_1.localStorageTokenCache; }
        if (baseUrl === void 0) { baseUrl = __1.DEFAULT_BASE_URL; }
        var _this = _super.call(this, tokenCache) || this;
        _this.clientId = clientId;
        _this.callback = callback;
        _this.authServer = authServer;
        _this.baseUrl = baseUrl;
        if (!utils_2.isBrowser) {
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
                        authServer = this.authServer || _1.DEFAULT_AUTH_SERVER;
                        audience = this.baseUrl || __1.DEFAULT_BASE_URL;
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
                        authServer = this.authServer || _1.DEFAULT_AUTH_SERVER;
                        body = {
                            grant_type: 'authorization_code',
                            client_id: this.clientId,
                            code_verifier: verifier,
                            redirect_uri: this.callback,
                            code: code,
                        };
                        return [4 /*yield*/, fetch((0, utils_1.join)(authServer, 'oauth', 'token'), {
                                method: 'POST',
                                headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
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
}(_1.Authenticator));
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

},{"..":10,"../utils":12,"./":8,"./TokenCache":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localStorageTokenCache = void 0;
/**
 * Implementation of TokenCache that uses localStorage to cache tokens.
 */
exports.localStorageTokenCache = {
    get: function () {
        if (typeof window === 'undefined') {
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
    },
    set: function (token, expires) {
        if (typeof window === 'undefined') {
            return;
        }
        localStorage.setItem("@spinque/query-api/access-token", token);
        localStorage.setItem("@spinque/query-api/expires", "".concat(expires));
    },
};

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localStorageTokenCache = exports.PKCE = exports.ClientCredentials = exports.Authenticator = exports.DEFAULT_AUTH_SERVER = void 0;
var Authenticator_1 = require("./Authenticator");
Object.defineProperty(exports, "Authenticator", { enumerable: true, get: function () { return Authenticator_1.Authenticator; } });
var ClientCredentials_1 = require("./ClientCredentials");
Object.defineProperty(exports, "ClientCredentials", { enumerable: true, get: function () { return ClientCredentials_1.ClientCredentials; } });
var PKCE_1 = require("./PKCE");
Object.defineProperty(exports, "PKCE", { enumerable: true, get: function () { return PKCE_1.PKCE; } });
var TokenCache_1 = require("./TokenCache");
Object.defineProperty(exports, "localStorageTokenCache", { enumerable: true, get: function () { return TokenCache_1.localStorageTokenCache; } });
exports.DEFAULT_AUTH_SERVER = 'https://login.spinque.com/';

},{"./Authenticator":4,"./ClientCredentials":5,"./PKCE":6,"./TokenCache":7}],9:[function(require,module,exports){
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

},{"./utils":12}],10:[function(require,module,exports){
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

},{"./Api":2,"./FacetedSearch":3,"./authentication":8,"./clusters":9,"./types":11,"./utils":12}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.UnauthorizedError = exports.EndpointNotFoundError = exports.ApiNotFoundError = exports.WorkspaceConfigNotFoundError = exports.ErrorResponse = void 0;
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
 * Error class used when Spinque cannot find the workspace configuration you requested.
 * The workspace or configuration might be misspelled or removed.
 */
var WorkspaceConfigNotFoundError = /** @class */ (function () {
    function WorkspaceConfigNotFoundError(message, status) {
        this.message = message;
        this.status = status;
    }
    return WorkspaceConfigNotFoundError;
}());
exports.WorkspaceConfigNotFoundError = WorkspaceConfigNotFoundError;
/**
 * Error class used when Spinque cannot find the API you requested.
 * The API might be misspelled or removed.
 */
var ApiNotFoundError = /** @class */ (function () {
    function ApiNotFoundError(message, status) {
        this.message = message;
        this.status = status;
    }
    return ApiNotFoundError;
}());
exports.ApiNotFoundError = ApiNotFoundError;
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

},{}],12:[function(require,module,exports){
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
exports.isBrowser = exports.stringifyQueries = exports.parseQueries = exports.join = exports.tupleListToString = exports.stringToTupleList = exports.urlFromQueries = exports.apiStatusUrl = exports.apiUrl = exports.pathFromQuery = exports.pathFromQueries = void 0;
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
 * Takes an ApiConfig object and returns the URL to fetch API details
 */
var apiUrl = function (config) {
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
    // For loadbalancer reasons, the API URL should end with a slash
    if (!url.endsWith('/')) {
        url += '/';
    }
    // Add config if provided
    if (config.config) {
        url += "?config=".concat(config.config);
    }
    return url;
};
exports.apiUrl = apiUrl;
/**
 * Takes an ApiConfig object and returns the URL to fetch API status
 */
var apiStatusUrl = function (config) {
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
    url += (0, exports.join)(config.version, config.workspace, 'api', config.api, 'status');
    // Add config if provided
    if (config.config) {
        url += "?config=".concat(config.config);
    }
    return url;
};
exports.apiStatusUrl = apiStatusUrl;
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
exports.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

},{}]},{},[1]);
