import { SchemaDirectiveVisitor } from "graphql-tools";
import { GraphQLDirective } from "graphql";
export declare class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName: any, schema: any): GraphQLDirective;
    visitObject(obj: any): void;
    visitFieldDefinition(field: any): void;
}
