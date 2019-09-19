export default function() {
  let httpEndpoint = process.env.APOLLO_SERVER_HTTP || 'http://localhost:4002/api';

  if (process.client) {
    httpEndpoint = process.env.APOLLO_CLIENT_HTTP || 'http://localhost:4002/api'
  }

  return {
    httpEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    ssr: true,
    tokenName: 'access_token',
  }
}
