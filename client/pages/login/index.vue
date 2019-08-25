<template>
  <section class="container">
    <form v-if="!isLoggedIn" @submit.prevent="login">
      <h1>Авторизация</h1>
      <label for="username" id="emailLabel">
        Email
      </label>
      <input v-model="credentials.email" type="email" name="email" placeholder="ivan@ortgraph.ru" aria-describedby="emailLabel" required />

      <password-field :defaultValue="credentials.password" @passwordChanged="value => credentials.password = value" />

      <p v-if="isError" class="error">{{errorMessage}}</p>

      <base-button type="submit">
        Войти
      </base-button>
    </form>
  </section>
</template>

<script>
import { authenticateUserGql } from '~/constants/gql'
import { fetechUserProfile } from '~/constants/user'

export default {
  computed: {
    isLoggedIn() {
      return this.$store.state.auth.isLoggedIn
    }
  },
  data: () => ({
    credentials: {
      password: 'rootroot',
      email: 'shiningfinger@list.ru',
    },
    isError: false,
    errorMessage: '',
  }),
  methods: {
    async login() {
      try {
        const response = await this.$apollo.mutate({
          mutation: authenticateUserGql,
          variables: this.credentials,
        }).then(({ data }) => data.login)
        .catch(() => this.handleError('Неудалось авторизоваться'))
        const email = this.$lodash.get(response, 'email')
        if (email) {
          fetechUserProfile.call(this, email)
          const { access, refresh } = response
          this.$cookies.set('access_token', access)
          this.$cookies.set('refresh_token', refresh)
          this.$router.push('/')
        }
      } catch (e) {
        console.error(e)
      }
    },
    handleError(message) {
      this.errorMessage = message
      this.isError = true
    },
  },
  beforeMount() {
    if (this.isLoggedIn) this.$router.push('/')
  },
}
</script>