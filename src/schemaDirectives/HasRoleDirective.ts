import { SchemaDirectiveVisitor } from "apollo-server";
import { DirectiveLocation, GraphQLDirective, GraphQLList ,defaultFieldResolver} from "graphql";
import { AuthorizationError } from '../errors'

export class HasRoleDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName, schema) {
    return new GraphQLDirective({
      name: "hasRole",
      locations: [DirectiveLocation.FIELD_DEFINITION
        // , DirectiveLocation.OBJECT
      ],
      args: {
        roles: {
          type: new GraphQLList(schema.getType("Role")),
          defaultValue: null
        }
      }
    });
  }

  visitFieldDefinition(field) {



    const { resolve = defaultFieldResolver } = field;

    const directiveArgs = this.args;
    if(!directiveArgs||!directiveArgs.roles||!directiveArgs.roles.length||!directiveArgs.roles[0].length){
      throw new Error("Invalid roles specified for directive 'hasRole'")
    }


    field.resolve = async function (...args) {
      const ctx = args[2]; // context

      try {
      
        const { sub:subId } = await ctx.userToken()


        const user = await ctx.db.query.user({ where: { subId } })

        const userRole= user.role
        
        if (!(directiveArgs.roles.some(role => [userRole].indexOf(role) !== -1))) {
            throw new AuthorizationError('User does not have all roles required')
        }


        if (user.role!==directiveArgs.roles[0]){
          throw new AuthorizationError('You do not have the required role')
        }

      }catch(err){
        console.error(err)
        throw err
      }
      const result = await resolve.apply(this, args);

      return result;
    };

  }

  // visitObject(obj) {

  //   const fields = obj.getFields();
  //   const expectedRoles = this.args.roles;

  //   Object.keys(fields).forEach(fieldName => {
  //     const field = fields[fieldName];
  //     field.resolve = async function(result, args, context, info) {

  //       const token = context.headers.authorization;
  //       try {
      
  //         throw new AuthorizationError({
  //           message: "You are not authorized for this resource"
  //         });
  //       } catch (err) {
  //         throw new AuthorizationError({ message: "You are not authorized!!" });
  //       }
  //     };
  //   });
  // }
}