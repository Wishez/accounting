export default function() {
  let httpEndpoint = process.env.TEST_APOLLO_SERVER_HTTP || process.env.APOLLO_SERVER_HTTP || 'http://localhost:8444/api'
  if (process.client) {
    httpEndpoint = 'http://localhost:8444/api'
  }

  return {
    httpEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    tokenName: 'access_token', 
  }
}
