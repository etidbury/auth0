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
const apollo_server_1 = require("apollo-server");
const graphql_1 = require("graphql");
const errors_1 = require("../errors");
class HasRoleDirective extends apollo_server_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName, schema) {
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
    }
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        const directiveArgs = this.args;
        if (!directiveArgs || !directiveArgs.roles || !directiveArgs.roles.length || !directiveArgs.roles[0].length) {
            throw new Error("Invalid roles specified for directive 'hasRole'");
        }
        field.resolve = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = args[2];
                try {
                    const { sub: subId } = yield ctx.userToken();
                    const user = yield ctx.db.query.user({ where: { subId } });
                    const userRole = user.role;
                    if (!(directiveArgs.roles.some(role => [userRole].indexOf(role) !== -1))) {
                        throw new errors_1.AuthorizationError('User does not have all roles required');
                    }
                    if (user.role !== directiveArgs.roles[0]) {
                        throw new errors_1.AuthorizationError('You do not have the required role');
                    }
                }
                catch (err) {
                    console.error(err);
                    throw err;
                }
                const result = yield resolve.apply(this, args);
                return result;
            });
        };
    }
}
exports.HasRoleDirective = HasRoleDirective;
//# sourceMappingURL=HasRoleDirective.js.map