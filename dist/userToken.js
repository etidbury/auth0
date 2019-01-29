"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { AUTH0_DOMAIN } = process.env;
if (!AUTH0_DOMAIN || !AUTH0_DOMAIN.length) {
    throw new TypeError('validateAndParseIdToken(): AUTH0_DOMAIN environment variable is not set');
}
const jwks = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 60,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});
exports.verifyAndDecodeIdToken = (idToken) => new Promise((resolve, reject) => {
    try {
        let resolved = false;
        setTimeout(() => {
            if (!resolved) {
                reject();
            }
        }, 60 * 1000);
        const { header, payload } = jwt.decode(idToken, { complete: true });
        if (!header || !header.kid || !payload)
            reject(new Error('Invalid Token'));
        jwks.getSigningKey(header.kid, (err, key) => {
            if (err) {
                return reject(new Error('Error getting signing key: ' + err.message));
            }
            if (!key) {
                return reject(new Error('No key found'));
            }
            jwt.verify(idToken, key.publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
                if (err)
                    reject('jwt verify error: ' + err.message);
                resolved = true;
                resolve(decoded);
            });
        });
    }
    catch (err) {
        console.error(err);
        reject(new Error('Invalid Token'));
    }
});
//# sourceMappingURL=userToken.js.map