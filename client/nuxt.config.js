module.exports = {
  css: [
    '~/assets/fonts/fonts.scss',
  ],

  plugins: [
    { src: '~/plugins/cookies.js', mode: 'client' },
    { src: '~/plugins/components.client.js', mode: 'client' },
    '~/plugins/components.js',
    '~/plugins/lodash.js',
    '~/plugins/env.js',
    '~/plugins/plugins.js',
    '~/plugins/globalFilters.js',
  ],
  /*
  ** Headers of the page
  */
  head: {
    title: 'accounting',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Accounting for business.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      // Add plugin names as key and arguments as value
      // Install them before as dependencies with npm or yarn
      plugins: {
        // Disable a plugin by passing false as value 
        'postcss-url': false,
        // 'postcss-nested': {},
        'postcss-custom-media': {
          importFrom: [
            {
              customMedia: {
                "--from-desktop": "(min-width: 1152px)",
                "--from-mobile": "(min-width: 321px)",
                "--until-mobile": "(max-width: 321px)",
                "--until-tablet": "(max-width: 768px)",
                "--from-tablet": "(min-width: 768px)",
              }
            }
          ]
        }
        // 'postcss-responsive-type': {},
        // 'postcss-hexrgba': {}
      },
      // preset: {
        // Change the postcss-preset-env settings
      //   autoprefixer: {
      //     grid: true
      //   }
      // }
    },
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  modules: [
    ['qonfucius-nuxt-fontawesome', {
      componentName: 'fa-icon',
      packs: [
        {
          package: '@fortawesome/free-solid-svg-icons',
          icons: ['faIgloo', 'faHome', 'faSignOutAlt', 'faSignInAlt', 'faChartPie', 'faEyeSlash', 'faEye', 'faTimes', 'faUsers', 'faCheckCircle'],
        },
      ],
      includeCss: true,
    }],
    '@nuxtjs/apollo',
    '@radial-color-picker/vue-color-picker/nuxt'
  ],

  apollo: {
    tokenName: 'access_token', // optional, default: apollo-token
    cookieAttributes: {
      /**
        * Define when the cookie will be removed. Value can be a Number
        * which will be interpreted as days from time of creation or a
        * Date instance. If omitted, the cookie becomes a session cookie.
        */
      expires: 7, // optional, default: 7 (days)

      /**
        * Define the path where the cookie is available. Defaults to '/'
        */
      path: '/api', // optional
      /**
        * Define the domain where the cookie is available. Defaults to
        * the domain of the page where the cookie was created.
        */
      domain: 'http://localhost:4000/', // optional

      /**
        * A Boolean indicating if the cookie transmission requires a
        * secure protocol (https). Defaults to false.
        */
      secure: false,
    },
    includeNodeModules: true, // optional, default: false (this includes graphql-tag for node_modules folder)

    // (Optional) Default 'apollo' definition
    defaultOptions: {
      // See 'apollo' definition
      // For example: default query options

      // $watchQuery: {
      //   fetchPolicy: 'network-only',
      //   errorPolicy: 'ignore',
      // },
      // $query: {
      //   fetchPolicy: 'network-only',
      //   errorPolicy: 'all',
      // },
    },
    // optional
    errorHandler: '~/plugins/apollo-error-handler.js',
    // required
    clientConfigs: {
      default: {
        // required
        httpEndpoint: 'http://localhost:4000/api',
        // optional
        // See https://www.apollographql.com/docs/link/links/http.html#options
        httpLinkOptions: {
          credentials: 'same-origin'
        },

        ssr: true,
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        // wsEndpoint: 'ws://localhost:4000/api', // optional
        // LocalStorage token
        tokenName: 'access_token', // optional
        // Enable Automatic Query persisting with Apollo Engine
        persisting: false, // Optional
        // Use websockets for everything (no HTTP)
        // You need to pass a `wsEndpoint` for this to work
        websocketsOnly: false // Optional
      },
      // test: {
      //   httpEndpoint: 'http://localhost:5000',
      //   wsEndpoint: 'ws://localhost:5000',
      //   tokenName: 'access_token'
      // },
      // alternative: user path to config which returns exact same config options
      // test2: '~/plugins/my-alternative-apollo-config.js'
    }
  },
}
