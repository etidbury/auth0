import { SchemaDirectiveVisitor } from "graphql-tools";
import { GraphQLDirective } from "graphql";
export declare class IsOwnerOrHasRoleDirective extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName: any, schema: any): GraphQLDirective;
    visitFieldDefinition(field: any): void;
}
