"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwksClient = require('jwks-rsa');
var jwt = require('jsonwebtoken');
var AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
if (!AUTH0_DOMAIN || !AUTH0_DOMAIN.length) {
    throw new TypeError('validateAndParseIdToken(): AUTH0_DOMAIN environment variable is not set');
}
var jwks = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 60,
    jwksUri: "https://" + process.env.AUTH0_DOMAIN + "/.well-known/jwks.json"
});
exports.verifyAndDecodeIdToken = function (idToken) { return new Promise(function (resolve, reject) {
    try {
        var resolved_1 = false;
        setTimeout(function () {
            if (!resolved_1) {
                reject();
            }
        }, 60 * 1000);
        var _a = jwt.decode(idToken, { complete: true }), header = _a.header, payload = _a.payload;
        if (!header || !header.kid || !payload)
            reject(new Error('Invalid Token'));
        jwks.getSigningKey(header.kid, function (err, key) {
            if (err) {
                return reject(new Error('Error getting signing key: ' + err.message));
            }
            if (!key) {
                return reject(new Error('No key found'));
            }
            jwt.verify(idToken, key.publicKey, { algorithms: ['RS256'] }, function (err, decoded) {
                if (err)
                    reject('jwt verify error: ' + err.message);
                resolved_1 = true;
                resolve(decoded);
            });
        });
    }
    catch (err) {
        console.error(err);
        reject(new Error('Invalid Token'));
    }
}); };
//# sourceMappingURL=userToken.js.map