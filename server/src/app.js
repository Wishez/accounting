const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

const resolvers = require('./resolvers')
const context = require('./context')
const schemaString = require('./schema')

const AccountingAPI = require('./datasources/accounting')
const AuthAPI = require('./datasources/auth').api
const env = require('./env')

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
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }))

const excelParserRoutes = require('./routes/excelParser')
app.use('/api/excel', excelParserRoutes)

const graphqlPath = '/api' 
server.applyMiddleware({ app, path: graphqlPath, cors: true })


const port = env.APP_PORT || 4002
const host = env.APP_HOST
app.listen({ port, host }, () => {
    console.log(`🚀 Server ready at http://${host || 'localhost'}:${port}${server.graphqlPath}`)
})