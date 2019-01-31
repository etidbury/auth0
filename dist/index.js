"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var Cookies = require("js-cookie");
var HasRoleDirective_1 = require("./schemaDirectives/HasRoleDirective");
exports.hasRole = HasRoleDirective_1.HasRoleDirective;
var IsAuthenticatedDirective_1 = require("./schemaDirectives/IsAuthenticatedDirective");
exports.isAuthenticated = IsAuthenticatedDirective_1.IsAuthenticatedDirective;
var IsOwnerOrHasRoleDirective_1 = require("./schemaDirectives/IsOwnerOrHasRoleDirective");
exports.isOwnerOrHasRole = IsOwnerOrHasRoleDirective_1.IsOwnerOrHasRoleDirective;
var userToken_1 = require("./userToken");
exports.verifyAndDecodeIdToken = userToken_1.verifyAndDecodeIdToken;
var _a = process.env, AUTH0_API_AUDIENCE = _a.AUTH0_API_AUDIENCE, AUTH0_DOMAIN = _a.AUTH0_DOMAIN, AUTH0_CLIENT_ID = _a.AUTH0_CLIENT_ID, AUTH0_REDIRECT_URL = _a.AUTH0_REDIRECT_URL;
var isBrowser = typeof window !== "undefined";
var _getCookies = function (ctx) {
    if (ctx === void 0) { ctx = {}; }
    var isBrowser = typeof window !== "undefined";
    if (!isBrowser) {
        if (!ctx || !ctx.req || !ctx.req.headers)
            return {};
        var cookies = ctx.req.headers.cookie;
        if (!cookies)
            return {};
        return require('cookie').parse(cookies);
    }
    else {
        return require('component-cookie')();
    }
};
exports.checkIsAuthenticated = function (ctx) {
    var cookies = _getCookies(ctx);
    var expiresAtStore = cookies && cookies.expires_at;
    var expiresAt = expiresAtStore ? JSON.parse(expiresAtStore) : 0;
    return new Date().getTime() < expiresAt;
};
var _initLock = function (optionalParams) {
    if (optionalParams === void 0) { optionalParams = {}; }
    var redirectURL = AUTH0_REDIRECT_URL;
    var Auth0Lock = require('auth0-lock').default;
    var lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, Object.assign({
        oidcConformant: true,
        autoclose: true,
        auth: {
            redirect: !!redirectURL,
            sso: true,
            redirectUrl: redirectURL,
            responseType: 'token id_token',
            audience: AUTH0_API_AUDIENCE,
            params: {
                scope: 'openid profile email user_metadata app_metadata picture'
            }
        },
        optionalParams: optionalParams
    }));
    lock.on('authenticated', function (_a) {
        var idToken = _a.idToken, accessToken = _a.accessToken, expiresIn = _a.expiresIn;
        _setSession({ idToken: idToken, accessToken: accessToken, expiresIn: expiresIn });
    });
    return lock;
};
var _setSession = function (_a) {
    var accessToken = _a.accessToken, idToken = _a.idToken, expiresIn = _a.expiresIn;
    if (!process.browser) {
        throw new Error('setSession(...) needs to be called client-side');
    }
    if (accessToken) {
        var expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime());
        var expiresAtUnix = parseInt(expiresAt);
        Cookies.set('access_token', accessToken, { expires: new Date(expiresAtUnix) });
        Cookies.set('expires_at', expiresAt, { expires: new Date(expiresAtUnix) });
        if (idToken && idToken.length) {
            Cookies.set('id_token', idToken, { expires: new Date(expiresAtUnix) });
        }
    }
    else {
        throw new TypeError('Invalid response from Auth0 client');
    }
};
exports.getAccessToken = function (ctx) {
    var cookies = _getCookies(ctx);
    return cookies && cookies.access_token || '';
};
exports.authorizeViaPopup = function (optionalParams) {
    if (optionalParams === void 0) { optionalParams = {}; }
    return __awaiter(_this, void 0, void 0, function () {
        var _lock;
        return __generator(this, function (_a) {
            _lock = _initLock(optionalParams);
            return [2, new Promise(function (resolve, reject) {
                    _lock.on('authenticated', function (_a) {
                        var idToken = _a.idToken, accessToken = _a.accessToken, expiresIn = _a.expiresIn, idTokenPayload = _a.idTokenPayload;
                        _setSession({ idToken: idToken, accessToken: accessToken, expiresIn: expiresIn });
                        resolve({ idToken: idToken, accessToken: accessToken, expiresIn: expiresIn, idTokenPayload: idTokenPayload });
                    });
                    _lock.on('authorization_error', function (err) {
                        console.error(err);
                        reject(err);
                    });
                    _lock.show();
                })];
        });
    });
};
exports.logout = function (redirectTo) {
    if (!isBrowser) {
        throw new Error('logout() needs to be called client-side');
    }
    Cookies.remove('user_id');
    Cookies.remove('access_token');
    Cookies.remove('id_token');
    Cookies.remove('expires_at');
    if (redirectTo && redirectTo.length) {
        window.location.href = redirectTo;
    }
    else {
        window.location.reload();
    }
};
exports.getUserInfo = function (accessToken) {
    var _lock = _initLock();
    return new Promise(function (resolve, reject) {
        return _lock.getUserInfo(accessToken, function (error, profile) {
            if (error) {
                reject(error);
                return;
            }
            resolve(profile);
        });
    });
};
exports.dateAddDay = function (days) {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
};
exports.setUserId = function (userId) {
    if (!isBrowser) {
        throw new Error('setUserId() needs to be called client-side');
    }
    Cookies.set('user_id', userId, { expires: exports.dateAddDay(5) });
};
exports.getUserId = function (ctx) {
    var cookies = _getCookies(ctx);
    return cookies && cookies.user_id;
};
//# sourceMappingURL=index.js.map