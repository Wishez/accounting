const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

const resolvers = require('./resolvers')
const schemaString = require('./schema')
const resolvePath = (pathTo) =>
  path.join(path.normalize(process.cwd()), pathTo)

const server = new ApolloServer({
    typeDefs: schemaString,
    dataSources: () => ({
        
    }),
    resolvers,
    context: ({ req }) => {
        return {}
    }
})

const app = express()
const staticPath = '/static'
app.use(staticPath, express.static(resolvePath('static')))
// app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.get('*', (req, res) => {
    
})

const graphqlPath = '/graphql' 
server.applyMiddleware({ app, path: graphqlPath })

const PORT = 4000
app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
})