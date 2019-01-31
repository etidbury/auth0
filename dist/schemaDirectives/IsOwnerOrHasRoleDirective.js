"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
var graphql_1 = require("graphql");
var errors_1 = require("../errors");
var lodash_1 = require("lodash");
var IsOwnerOrHasRoleDirective = (function (_super) {
    __extends(IsOwnerOrHasRoleDirective, _super);
    function IsOwnerOrHasRoleDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IsOwnerOrHasRoleDirective.getDirectiveDeclaration = function (directiveName, schema) {
        return new graphql_1.GraphQLDirective({
            name: "isOwnerOrHasRole",
            locations: [
                graphql_1.DirectiveLocation.FIELD_DEFINITION
            ],
            args: {
                ownerWherePath: {
                    type: schema.getType("String"),
                    defaultValue: "user.id"
                },
                roles: {
                    type: new graphql_1.GraphQLList(schema.getType("Role")),
                    defaultValue: null
                }
            }
        });
    };
    IsOwnerOrHasRoleDirective.prototype.visitFieldDefinition = function (field) {
        var _a = field.resolve, resolve = _a === void 0 ? graphql_1.defaultFieldResolver : _a;
        var directiveArgs = this.args;
        if (!directiveArgs) {
            throw new Error("[@isOwnerOrHasRole] Invalid arguments specified");
        }
        if (!directiveArgs.roles || !directiveArgs.roles.length || !directiveArgs.roles[0].length) {
            throw new Error("[@isOwnerOrHasRole] Invalid roles specified");
        }
        if (!directiveArgs.ownerWherePath || !directiveArgs.ownerWherePath.length) {
            throw new Error("[@isOwnerOrHasRole] Invalid ownerWherePath specified");
        }
        field.resolve = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var ctx, result, subId, user, queryVars, userRole_1, ownerWherePathValue, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx = args[2];
                            return [4, resolve.apply(this, args)];
                        case 1:
                            result = _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 6]);
                            return [4, ctx.userToken()];
                        case 3:
                            subId = (_a.sent()).sub;
                            return [4, ctx.db.query.user({ where: { subId: subId } })];
                        case 4:
                            user = _a.sent();
                            queryVars = args[1];
                            userRole_1 = user.role;
                            if ((directiveArgs.roles.some(function (role) { return [userRole_1].indexOf(role) !== -1; }))) {
                                return [2, result];
                            }
                            if (!queryVars || !queryVars.where) {
                                throw new Error("[@isOwnerOrHasRole] This query needs to have a where query as per 'isOwnerOrHasRole' directive rules");
                            }
                            ownerWherePathValue = void 0;
                            try {
                                ownerWherePathValue = lodash_1.get(queryVars.where, directiveArgs.ownerWherePath);
                            }
                            catch (err) {
                                console.error('Error', err);
                                console.error("Invalid owner field path. Make sure the path resolves to type ID!", 'ownerWherePath:', ownerWherePathValue, 'where query:', queryVars.where);
                                throw new Error('[@isOwnerOrHasRole] Invalid owner field path');
                            }
                            if (!ownerWherePathValue || !ownerWherePathValue.length) {
                                console.error("Invalid where query. Could not resolve '" + directiveArgs.ownerWherePath + "' from where query", queryVars.where);
                                throw new Error("[@isOwnerOrHasRole] Invalid where query. Could not resolve '" + directiveArgs.ownerWherePath + "' from where query");
                            }
                            if (ownerWherePathValue !== user.id) {
                                throw new errors_1.AuthorizationError("'" + directiveArgs.ownerWherePath + "' value in where query does not match user ID authorized");
                            }
                            return [2, result];
                        case 5:
                            err_1 = _a.sent();
                            console.error(err_1);
                            throw err_1;
                        case 6: return [2, result];
                    }
                });
            });
        };
    };
    return IsOwnerOrHasRoleDirective;
}(apollo_server_1.SchemaDirectiveVisitor));
exports.IsOwnerOrHasRoleDirective = IsOwnerOrHasRoleDirective;
//# sourceMappingURL=IsOwnerOrHasRoleDirective.js.map