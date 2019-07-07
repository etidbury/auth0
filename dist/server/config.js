"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var config = {};
var CONFIG_FILE_DIR = './config/auth0';
try {
    config = require(path.join(process.cwd(), CONFIG_FILE_DIR));
    var requiredVars = [
        'AUTH0_API_AUDIENCE',
        'AUTH0_DOMAIN',
        'AUTH0_CLIENT_ID',
    ];
    for (var i = 0; i < requiredVars.length; i++) {
        var requiredVar = requiredVars[i];
        if (!config[requiredVar] || !config[requiredVar].length) {
            throw new TypeError(requiredVar + " not specified in " + CONFIG_FILE_DIR);
        }
    }
}
catch (err) {
    throw new Error("Make sure you have specified " + CONFIG_FILE_DIR + " in your project");
}
exports.default = config;
//# sourceMappingURL=config.js.map