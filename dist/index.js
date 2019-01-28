"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cookies = require("js-cookie");
var HasRoleDirective_1 = require("./schemaDirectives/HasRoleDirective");
exports.hasRole = HasRoleDirective_1.HasRoleDirective;
var IsAuthenticatedDirective_1 = require("./schemaDirectives/IsAuthenticatedDirective");
exports.isAuthenticated = IsAuthenticatedDirective_1.IsAuthenticatedDirective;
var IsOwnerOrHasRoleDirective_1 = require("./schemaDirectives/IsOwnerOrHasRoleDirective");
exports.isOwnerOrHasRole = IsOwnerOrHasRoleDirective_1.IsOwnerOrHasRoleDirective;
const { AUTH0_API_AUDIENCE, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_REDIRECT_URL } = process.env;
const isBrowser = typeof window !== "undefined";
const _getCookies = (ctx = {}) => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) {
        if (!ctx || !ctx.req || !ctx.req.headers)
            return {};
        const cookies = ctx.req.headers.cookie;
        if (!cookies)
            return {};
        return require('cookie').parse(cookies);
    }
    else {
        return require('component-cookie')();
    }
};
exports.checkIsAuthenticated = (ctx) => {
    const cookies = _getCookies(ctx);
    const expiresAtStore = cookies && cookies.expires_at;
    const expiresAt = expiresAtStore ? JSON.parse(expiresAtStore) : 0;
    return new Date().getTime() < expiresAt;
};
const _initLock = (optionalParams = {}) => {
    const redirectURL = AUTH0_REDIRECT_URL;
    const Auth0Lock = require('auth0-lock').default;
    const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, Object.assign({
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
        optionalParams
    }));
    lock.on('authenticated', ({ idToken, accessToken, expiresIn }) => {
        _setSession({ idToken, accessToken, expiresIn });
    });
    return lock;
};
const _setSession = ({ accessToken, idToken, expiresIn }) => {
    if (!process.browser) {
        throw new Error('setSession(...) needs to be called client-side');
    }
    if (accessToken) {
        let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime());
        const expiresAtUnix = parseInt(expiresAt);
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
exports.getAccessToken = (ctx) => {
    const cookies = _getCookies(ctx);
    return cookies && cookies.access_token || '';
};
exports.authorizeViaPopup = (optionalParams = {}) => __awaiter(this, void 0, void 0, function* () {
    const _lock = _initLock(optionalParams);
    return new Promise((resolve, reject) => {
        _lock.on('authenticated', ({ idToken, accessToken, expiresIn, idTokenPayload }) => {
            _setSession({ idToken, accessToken, expiresIn });
            resolve({ idToken, accessToken, expiresIn, idTokenPayload });
        });
        _lock.on('authorization_error', err => {
            console.error(err);
            reject(err);
        });
        _lock.show();
    });
});
exports.logout = (redirectTo) => {
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
exports.getUserInfo = (accessToken) => {
    const _lock = _initLock();
    return new Promise((resolve, reject) => {
        return _lock.getUserInfo(accessToken, (error, profile) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(profile);
        });
    });
};
exports.dateAddDay = (days) => {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return result;
};
exports.setUserId = (userId) => {
    if (!isBrowser) {
        throw new Error('setUserId() needs to be called client-side');
    }
    Cookies.set('user_id', userId, { expires: exports.dateAddDay(5) });
};
exports.getUserId = (ctx) => {
    const cookies = _getCookies(ctx);
    return cookies && cookies.user_id;
};
//# sourceMappingURL=index.js.map