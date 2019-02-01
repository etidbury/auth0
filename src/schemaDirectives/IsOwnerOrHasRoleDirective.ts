import { SchemaDirectiveVisitor } from "graphql-tools"
import { DirectiveLocation, GraphQLDirective, GraphQLList ,defaultFieldResolver} from "graphql";
import { AuthorizationError } from '../errors'
import {get} from 'lodash'

export class IsOwnerOrHasRoleDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName, schema) {
    return new GraphQLDirective({
      name: "isOwnerOrHasRole",
      locations: [
        DirectiveLocation.FIELD_DEFINITION
      ],
      args: {
        ownerWherePath: {
          type: schema.getType("String"),
          defaultValue: "user.id"
        },
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
    
    if(!directiveArgs){
      throw new Error("[@isOwnerOrHasRole] Invalid arguments specified")
    }
    
    if(!directiveArgs.roles||!directiveArgs.roles.length||!directiveArgs.roles[0].length){
      throw new Error("[@isOwnerOrHasRole] Invalid roles specified")
    }

    if(!directiveArgs.ownerWherePath||!directiveArgs.ownerWherePath.length){
      throw new Error("[@isOwnerOrHasRole] Invalid ownerWherePath specified")
    }


    field.resolve = async function (...args) {
      const ctx = args[2]; // context
      const result = await resolve.apply(this, args);

      try {
      
        const { sub:subId } = await ctx.userToken()


        const user = await ctx.db.query.user({ where: { subId } })



        const queryVars = args[1]


        // if role matches, then resolve
        /*-------check role--------*/
        const userRole= user.role

        if ((directiveArgs.roles.some(role => [userRole].indexOf(role) !== -1))) {
            return result
        }
        /*------/check role--------*/
        // otherwise, continue to check query vars with ownerWherePath...
        
        if (!queryVars||!queryVars.where) {
          throw new Error("[@isOwnerOrHasRole] This query needs to have a where query as per 'isOwnerOrHasRole' directive rules")
        }

        /*-------check query has specified owner--------*/

        let ownerWherePathValue

        try {

          ownerWherePathValue = get(queryVars.where,directiveArgs.ownerWherePath)

        }catch (err){
          console.error('Error',err)
          console.error(`Invalid owner field path. Make sure the path resolves to type ID!`,'ownerWherePath:',ownerWherePathValue,'where query:',queryVars.where)
          throw new Error('[@isOwnerOrHasRole] Invalid owner field path')
        }

        if (!ownerWherePathValue||!ownerWherePathValue.length){
          console.error(`Invalid where query. Could not resolve '${directiveArgs.ownerWherePath}' from where query`,queryVars.where)
          throw new Error(`[@isOwnerOrHasRole] Invalid where query. Could not resolve '${directiveArgs.ownerWherePath}' from where query`)
        }




        if (ownerWherePathValue!==user.id){
          throw new AuthorizationError(`'${directiveArgs.ownerWherePath}' value in where query does not match user ID authorized`)
        }
        /*------/check query has specified owner--------*/

        return result

      }catch(err){
        console.error(err)
        throw err
      }
      

      return result;
    };

  }
}