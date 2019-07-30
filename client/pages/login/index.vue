<template>
  <section class="container">
    <form v-if="!isLoggedIn" @submit.prevent="login">
      <h1>Авторизация</h1>
      <label for="username" id="emailLabel">
        Email
      </label>
      <input v-model="credentials.email" type="email" name="email" placeholder="ivan@ortgraph.ru" aria-describedby="emailLabel" required />

      <label for="password" id="passwordLabel">
        Пароль
      </label>
      <div class="passwordInputContainer">
        <input
          v-model="credentials.password"
          :type="passwordFieldType"
          id="password"
          class="passwordInput"
          name="password"
          aria-describedby="passwordLabel"
          placeholder="secretWords"
          required
          minlength="8"
          maxlength="32"
        />
        <fa-icon class="passwordIcon" @click="changePasswordFieldView" :icon="['fas', passwordFieldType === 'password' ? 'eye-slash' : 'eye']" />
      </div>

      <p v-if="isError" class="error">{{errorMessage}}</p>

      <base-button type="submit">
        Войти
      </base-button>
    </form>
  </section>
</template>

<script>
import { authenticateUserGql } from '~/constants/gql'
const passwordTogglingMap = {
  password: 'text',
  text: 'password',
}

export default {
  computed: {
    isLoggedIn() {
      return this.$store.state.auth.isLoggedIn
    }
  },
  data: () => ({
    passwordFieldType: 'password',
    credentials: {
      password:  'rootroot',
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
          const { access, refresh, detail, email } = response
          this.$cookies.set('access_token', access)
          this.$cookies.set('refresh_token', refresh)
          this.$store.commit('auth/setLoggedInState', true)
          this.$apolloHelpers.onLogin(access)
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
    changePasswordFieldView() {
      this.passwordFieldType = passwordTogglingMap[this.passwordFieldType]
    }
  },
  beforeMount() {
    if (this.isLoggedIn) this.$router.push('/')
  },
}
</script>

<style lang="scss" scoped>
.passwordInputContainer {
  position: relative;
  width: 100%;
  margin-bottom: 2em;
}

.passwordInput {
  margin-bottom: 0;
}

.passwordIcon {
  position: absolute;
  bottom: .5em;
  right: .5em;
}
</style>