const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

const resolvers = require('./resolvers')
const context = require('./context')
const schemaString = require('./schema')

const AccountingAPI = require('./datasources/accounting')
const AuthAPI = require('./datasources/auth').api

const resolvePath = (pathTo) =>
  path.join(path.normalize(process.cwd()), pathTo)

const server = new ApolloServer({
    typeDefs: schemaString,
    dataSources: () => ({
      authAPI: new AuthAPI(),
      accountingAPI: new AccountingAPI(),
    }),
    resolvers,
    context,
})

const app = express()
const staticPath = '/static'
app.use(staticPath, express.static(resolvePath('static')))
app.use(morgan('dev'))
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const graphqlPath = '/api' 
server.applyMiddleware({ app, path: graphqlPath })

const PORT = 4000
app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
})