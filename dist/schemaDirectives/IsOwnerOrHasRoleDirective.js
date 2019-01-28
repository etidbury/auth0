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
const lodash_1 = require("lodash");
class IsOwnerOrHasRoleDirective extends apollo_server_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName, schema) {
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
    }
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        const directiveArgs = this.args;
        if (!directiveArgs) {
            throw new Error("[@isOwnerOrHasRole] Invalid arguments specified");
        }
        if (!directiveArgs.roles || !directiveArgs.roles.length || !directiveArgs.roles[0].length) {
            throw new Error("[@isOwnerOrHasRole] Invalid roles specified");
        }
        if (!directiveArgs.ownerWherePath || !directiveArgs.ownerWherePath.length) {
            throw new Error("[@isOwnerOrHasRole] Invalid ownerWherePath specified");
        }
        field.resolve = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = args[2];
                const result = yield resolve.apply(this, args);
                try {
                    const { sub: subId } = yield ctx.userToken();
                    const user = yield ctx.db.query.user({ where: { subId } });
                    const queryVars = args[1];
                    const userRole = user.role;
                    if ((directiveArgs.roles.some(role => [userRole].indexOf(role) !== -1))) {
                        return result;
                    }
                    if (!queryVars || !queryVars.where) {
                        throw new Error("[@isOwnerOrHasRole] This query needs to have a where query as per 'isOwnerOrHasRole' directive rules");
                    }
                    let ownerWherePathValue;
                    try {
                        ownerWherePathValue = lodash_1.get(queryVars.where, directiveArgs.ownerWherePath);
                    }
                    catch (err) {
                        console.error('Error', err);
                        console.error(`Invalid owner field path. Make sure the path resolves to type ID!`, 'ownerWherePath:', ownerWherePathValue, 'where query:', queryVars.where);
                        throw new Error('[@isOwnerOrHasRole] Invalid owner field path');
                    }
                    if (!ownerWherePathValue || !ownerWherePathValue.length) {
                        console.error(`Invalid where query. Could not resolve '${directiveArgs.ownerWherePath}' from where query`, queryVars.where);
                        throw new Error(`[@isOwnerOrHasRole] Invalid where query. Could not resolve '${directiveArgs.ownerWherePath}' from where query`);
                    }
                    if (ownerWherePathValue !== user.id) {
                        throw new errors_1.AuthorizationError(`'${directiveArgs.ownerWherePath}' value in where query does not match user ID authorized`);
                    }
                    return result;
                }
                catch (err) {
                    console.error(err);
                    throw err;
                }
                return result;
            });
        };
    }
}
exports.IsOwnerOrHasRoleDirective = IsOwnerOrHasRoleDirective;
//# sourceMappingURL=IsOwnerOrHasRoleDirective.js.map