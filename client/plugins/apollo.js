import { apiUrl } from '../config'

export default function() {
  let httpEndpoint = process.env.APOLLO_TEST_SERVER_HTTP || process.env.APOLLO_SERVER_HTTP || apiUrl
  if (process.client) {
    httpEndpoint = apiUrl
  }

  return {
    httpEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    tokenName: 'access_token', 
  }
}
