import { SchemaDirectiveVisitor } from "graphql-tools"
import { DirectiveLocation, GraphQLDirective, GraphQLList,defaultFieldResolver } from "graphql";
import { AuthorizationError } from '../errors'

export class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName, schema) {
    return new GraphQLDirective({
      name: "isAuthenticated",
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT]
    });
  }

  visitObject(obj) {
    const fields = obj.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (...args) {
        // const ctx = args[0]
        const ctx = args[2]; // context
  
        const { sub:subId } = await ctx.userToken()
  
        const user = await ctx.db.query.user({ where: { subId } })
        
  
        const result = await resolve.apply(this, args);
  
        //await args.req.user
  
        // if (typeof result === 'string') {
        //   return result.toUpperCase();
        // }
        return result;
      };

    });
  }

  visitFieldDefinition(field) {
    

    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function (...args) {
      // const ctx = args[0]
      const ctx = args[2]; // context
      const { sub:subId } = await ctx.userToken()

      const user = await ctx.db.query.user({ where: { subId } })

      const result = await resolve.apply(this, args);

      //await args.req.user

      // if (typeof result === 'string') {
      //   return result.toUpperCase();
      // }
      return result;
    };

  }
}