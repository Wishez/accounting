 <template>
  <section class="container login-page">
    <form v-if="!isLoggedIn" @submit.prevent="login">
      <h1>Авторизация</h1>
      <label for="username" id="emailLabel">
        Email
      </label>
      <input v-model="credentials.email" type="email" name="email" placeholder="ivan@ortgraph.ru" aria-describedby="emailLabel" required />

      <password-field :defaultValue="credentials.password" @passwordChanged="value => credentials.password = value" />

      <p v-if="isError" class="error">{{errorMessage}}</p>

      <div class="submit-button">
        <base-button type="submit">
          Войти
        </base-button>
      </div>

      <loader v-if="isLoading" />
    </form>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { authenticateUserGql } from '~/constants/gql'
import { fetechUserProfile } from '~/constants/user'

export default {
  computed: {
    ...mapState('auth', ['isLoggedIn']),
  },
  data: () => ({
    credentials: {
      password: '',
      email: '',
    },
    isError: false,
    errorMessage: '',
    isLoading: false,
  }),

  mounted() {
    this.credentials.email = window.localStorage.email
  },

  methods: {
    async login() {
      this.isLoading = true
      window.localStorage.email = this.credentials.email
      try {
        console.log(this.credentials)
        const response = await this.$apollo.mutate({
          mutation: authenticateUserGql,
          variables: this.credentials,
        }).then(({ data }) => data.login)
        .catch(() => this.handleError('Неудалось авторизоваться'))
        const email = this.$lodash.get(response, 'email')
        if (email) {
          console.log(response, email)
          await this.$apolloHelpers.onLogin(response.access)
          await fetechUserProfile.call(this, email)
          this.$router.push('/')
        }
      } catch (e) {
        console.error(e)
      }

      this.isLoading = false
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
