export default function() {
  let httpEndpoint = process.env.APOLLO_SERVER_HTTP || 'http://localhost:4002/api';

  if (process.client) {
    httpEndpoint = process.env.APOLLO_CLIENT_HTTP || 'http://localhost:4002/api'
  }

  return {
    cookieAttributes: {
      expires: 7,
      path: '/api',
      domain: httpEndpoint.slice(0, -4),
      secure: false,
    },
    httpEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    ssr: true,
    tokenName: 'access_token',
  }
}
