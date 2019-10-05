const ApolloClient = require('apollo-boost').ApolloClient;
const fetch = require('cross-fetch/polyfill').fetch;
const createHttpLink = require('apollo-link-http').createHttpLink;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;

const resolveResponse = requestName => ({ data }) => {
  const response = data[requestName] || {}
  const { isSuccess, data: result } = response
  return isSuccess ? result : null
}

class GraphqlClient {
  constructor(apiUrl) {
    this.client = new ApolloClient({
      link: createHttpLink({
          uri: apiUrl || 'http://localhost:4002/api',
          fetch,
      }),
      cache: new InMemoryCache()
    });
  }

  async query({ 
    query,
    requestName,
    context,
    variables,
  }) {
    const result = await this.client.query({
      query,
      context,
      variables,
    }).then(resolveResponse(requestName))
    return result
  }

  async mutate({ 
    mutation,
    requestName,
    context,
    variables,
  }) {
    return await this.client.mutate({
      mutation,
      context,
      variables,
    }).then(resolveResponse(requestName))
  }
}

module.exports = GraphqlClient
