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
var HasRoleDirective = (function (_super) {
    __extends(HasRoleDirective, _super);
    function HasRoleDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HasRoleDirective.getDirectiveDeclaration = function (directiveName, schema) {
        return new graphql_1.GraphQLDirective({
            name: "hasRole",
            locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION
            ],
            args: {
                roles: {
                    type: new graphql_1.GraphQLList(schema.getType("Role")),
                    defaultValue: null
                }
            }
        });
    };
    HasRoleDirective.prototype.visitFieldDefinition = function (field) {
        var _a = field.resolve, resolve = _a === void 0 ? graphql_1.defaultFieldResolver : _a;
        var directiveArgs = this.args;
        if (!directiveArgs || !directiveArgs.roles || !directiveArgs.roles.length || !directiveArgs.roles[0].length) {
            throw new Error("Invalid roles specified for directive 'hasRole'");
        }
        field.resolve = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var ctx, subId, user, userRole_1, err_1, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx = args[2];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4, ctx.userToken()];
                        case 2:
                            subId = (_a.sent()).sub;
                            return [4, ctx.db.query.user({ where: { subId: subId } })];
                        case 3:
                            user = _a.sent();
                            userRole_1 = user.role;
                            if (!(directiveArgs.roles.some(function (role) { return [userRole_1].indexOf(role) !== -1; }))) {
                                throw new errors_1.AuthorizationError('User does not have all roles required');
                            }
                            if (user.role !== directiveArgs.roles[0]) {
                                throw new errors_1.AuthorizationError('You do not have the required role');
                            }
                            return [3, 5];
                        case 4:
                            err_1 = _a.sent();
                            console.error(err_1);
                            throw err_1;
                        case 5: return [4, resolve.apply(this, args)];
                        case 6:
                            result = _a.sent();
                            return [2, result];
                    }
                });
            });
        };
    };
    return HasRoleDirective;
}(apollo_server_1.SchemaDirectiveVisitor));
exports.HasRoleDirective = HasRoleDirective;
//# sourceMappingURL=HasRoleDirective.js.map