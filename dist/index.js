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
const auth0_lock_1 = require("auth0-lock");
const { AUTH0_API_AUDIENCE, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CALLBACK_URL } = process.env;
const _initLock = () => {
    return new auth0_lock_1.default(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
        oidcConformant: true,
        autoclose: true,
        auth: {
            sso: false,
            redirectUrl: AUTH0_CALLBACK_URL,
            responseType: 'token id_token',
            audience: AUTH0_API_AUDIENCE,
            params: {
                scope: 'openid profile email user_metadata app_metadata picture'
            }
        },
    });
};
const _setSession = ({ accessToken, idToken, expiresIn }) => {
    if (!process.browser) {
        throw new Error('setSession(...) needs to be called client-side');
    }
    if (accessToken && idToken) {
        let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('id_token', idToken);
        localStorage.setItem('expires_at', expiresAt);
    }
    else {
        throw new TypeError('Invalid response from Auth0 client');
    }
};
exports.getAccessToken = () => {
    if (!exports.isAuthenticated()) {
        return false;
    }
    const accessTokenStore = localStorage.getItem('access_token');
    return accessTokenStore;
};
exports.authorizeViaPopup = () => __awaiter(this, void 0, void 0, function* () {
    const _lock = _initLock();
    const { idToken, accessToken, expiresIn } = yield new Promise((resolve, reject) => {
        _lock.on('authenticated', ({ idToken, accessToken, expiresIn }) => {
            resolve({ idToken, accessToken, expiresIn });
        });
        _lock.on('authorization_error', err => {
            console.error(err);
            alert(`Error: ${err.error}. Check the console for further details.`);
            reject(err);
        });
        _lock.show();
    });
    _setSession({ idToken, accessToken, expiresIn });
    return { idToken, accessToken };
});
exports.logout = (redirectTo) => {
    if (!process.browser) {
        throw new Error('logout() needs to be called client-side');
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    if (redirectTo && redirectTo.length) {
        window.location.href = redirectTo;
    }
    else {
        window.location.reload();
    }
};
exports.isAuthenticated = () => {
    if (!process.browser) {
        return false;
    }
    const expiresAtStore = localStorage.getItem('expires_at');
    const expiresAt = expiresAtStore ? JSON.parse(expiresAtStore) : 0;
    return new Date().getTime() < expiresAt;
};
//# sourceMappingURL=index.js.map