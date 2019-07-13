const GraphQLScalarType = require('graphql').GraphQLScalarType

const Details = new GraphQLScalarType({
    name: 'Details',
    description: 'Description of my custom scalar type',
    serialize(value) {
      return {
          ...value,
      };
    },
    parseValue(value) {
      return {
        ...value,
      };
    },
    // parseLiteral(ast) {
    //   switch (ast.kind) {
    //     // Implement your own behavior here by returning what suits your needs
    //     // depending on ast.kind
    //   }
    // }
});

module.exports = {
    Details,
}