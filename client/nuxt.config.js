module.exports = {
  css: [
    '~/assets/fonts/fonts.scss',
  ],

  server: {
    port: process.env.APP_PORT || 3333,
  },

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
  loading: { color: '#ffffff' },
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      plugins: {
        'postcss-url': false,
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
      },
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
          icons: ['faIgloo', 'faHome', 'faSignOutAlt', 'faSignInAlt', 'faChartPie', 'faEyeSlash', 'faEye', 'faTimes', 'faUsers', 'faCheckCircle', 'faSearch', 'faUserTie'],
        },
      ],
      includeCss: true,
    }],
    '@nuxtjs/apollo',
    '@radial-color-picker/vue-color-picker/nuxt'
  ],

  apollo: {
    tokenName: 'access_token', 

    cookieAttributes: {
      expires: 7,
      path: '/',
      domain: 'localhost',
      secure: false,
    },
    
    authenticationType: 'Bearer',

    errorHandler: '~/plugins/apollo-error-handler.js',

    clientConfigs: {
      // https://stackoverflow.com/questions/55444881/how-to-link-a-nuxt-app-to-an-api-server-in-docker-compose
      default: '~/plugins/apollo.js',
    }
  },
}
