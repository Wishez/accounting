import { graphqlApiAddress } from '../config'

export default function() {
  let httpEndpoint = process.env.TEST_APOLLO_SERVER_HTTP || process.env.APOLLO_SERVER_HTTP || graphqlApiAddress
  if (process.client) {
    httpEndpoint = graphqlApiAddress
  }

  return {
    httpEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    tokenName: 'access_token', 
  }
}
