"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (typeof process.env.AUTH0_API_AUDIENCE === "undefined") {
    throw new TypeError('Environment variable AUTH0_API_AUDIENCE not specified');
}
if (typeof process.env.AUTH0_DOMAIN === "undefined") {
    throw new TypeError('Environment variable AUTH0_DOMAIN not specified');
}
if (typeof process.env.AUTH0_CLIENT_ID === "undefined") {
    throw new TypeError('Environment variable AUTH0_CLIENT_ID not specified');
}
exports.AUTH0_API_AUDIENCE = process.env.AUTH0_API_AUDIENCE.replace(/\"/g, '');
exports.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN.replace(/\"/g, '');
exports.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID.replace(/\"/g, '');
exports.AUTH0_REDIRECT_URL = process.env.AUTH0_REDIRECT_URL ? process.env.AUTH0_REDIRECT_URL.replace(/\"/g, '') : null;
//# sourceMappingURL=config.js.map