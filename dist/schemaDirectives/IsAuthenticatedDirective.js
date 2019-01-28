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
class IsAuthenticatedDirective extends apollo_server_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName, schema) {
        return new graphql_1.GraphQLDirective({
            name: "isAuthenticated",
            locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION, graphql_1.DirectiveLocation.OBJECT]
        });
    }
    visitObject(obj) {
        const fields = obj.getFields();
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const { resolve = graphql_1.defaultFieldResolver } = field;
            field.resolve = function (...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    const ctx = args[2];
                    const { sub: subId } = yield ctx.userToken();
                    const user = yield ctx.db.query.user({ where: { subId } });
                    const result = yield resolve.apply(this, args);
                    return result;
                });
            };
        });
    }
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        field.resolve = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = args[2];
                const { sub: subId } = yield ctx.userToken();
                const user = yield ctx.db.query.user({ where: { subId } });
                const result = yield resolve.apply(this, args);
                return result;
            });
        };
    }
}
exports.IsAuthenticatedDirective = IsAuthenticatedDirective;
//# sourceMappingURL=IsAuthenticatedDirective.js.map