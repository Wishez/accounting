<template>
  <div class="holder">
    <header>
      <div class="container">
        <h1 class="mainTitle">
          <n-link to="/" class="mainTitle__link">
            <loader :shouldRotateLogo="false" />
            <span>БухУчёт</span>
          </n-link>
        </h1>
      </div>
    </header>
    <nuxt/>

    <footer>
      <div class="container">
        <nav class="navitaion">
          <ul class="navitaionItems">
            <menu-item
              v-for="({ name, to, icon, isExact, isShown }, index) in links"
              :isShown="isShown"
              :key="index"
              :name="name"
              :to="to"
              :icon="icon"
              :exact="isExact"
            />
          </ul>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script>
import { MenuItem } from '~/components'
import { verifyTokenGql, getProfileGql } from '~/constants/gql'
import { Roles } from '~/constants/user'

export default {
  computed: {
    links() {
      const { isLoggedIn, user } = this.$store.state.auth
      const isNotLoggedIn = !isLoggedIn
      return [
        {
          name: 'Главная',
          to: '/',
          icon: ['fas', 'igloo'],
          isExact: true,
          isShown: isLoggedIn,
        },
        {
          name: 'Статистика',
          to: '/statistics',
          icon: ['fas', 'chart-pie'],
          isShown: isLoggedIn,
        },
        {
          name: 'Пользователи',
          to: '/users',
          icon: ['fas', 'users'],
          isShown: isLoggedIn && user.role === Roles.ADMIN,
        },
        {
          name: 'Войти',
          to: '/login',
          icon: ['fas', 'sign-in-alt'],
          isShown:!isLoggedIn,
        },
        {
          name: 'Выйти',
          to: '/logout',
          icon: ['fas', 'sign-out-alt'],
          isShown:  isLoggedIn,
        },
      ]
    }
  },
  components: {
    MenuItem,
  },
  beforeMount() {
      const token = this.$cookies.get('access_token')
      if (token) this.verifyAuth(token)
      else this.redirectToLoginPage()
  },
  methods: {
    async verifyAuth(token) {
      try {
        const response = await this.$apollo.mutate({
          mutation: verifyTokenGql,
          variables: { token }
        }).then(({ data }) => data.verifyAuth)
        .catch(() => console.log('User unauthorized.'))

        const email = this.$lodash.get(response, 'email')
        this.$store.commit('auth/setLoggedInState', true)
        if (email) {
          const profileResponse = await this.$apollo.query({
            query: getProfileGql,
            variables: { email },
          }).then(({ data }) => data.profile.data)
            .catch((e) => console.log('Не получилось запросить данные аккаунта', e.message))
    
          if (profileResponse.id) this.$store.commit('auth/setCurrentProfile', profileResponse)
        } else this.redirectToLoginPage()
      } catch (e) {
        console.error(e)
      }
    },

    redirectToLoginPage() {
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">
@import '~/assets/styles/config/_colors.sass';
@import '~/assets/styles/base.scss';
.holder {
    padding-bottom: 141px;
}

header {
  background-image: linear-gradient($red 15%, transparent 0);
}

.mainTitle {
  display: flex;
  font-weight: bold;
  padding-top: .5em;

  &__link {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-decoration: none;
    margin: auto;
    
    &:visited {
      color: $darkGray;
    }
  }
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  background-color: #fff;
  padding-top: 1em;
}

.container {
  max-width: 1024px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1em;
}

.navigations {
  margin: 0 auto;
}
.navitaionItems {
  display: flex;
  justify-content: center;
}

</style>

