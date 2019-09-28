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
              v-for="({ name, to, icon, isExact, isShown, id }, index) in links"
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
import { fromEvent } from 'rxjs'
import { filter, map, throttleTime } from 'rxjs/operators'
import { MenuItem } from '~/components'
import { verifyTokenGql } from '~/constants/gql'
import { Roles, fetechUserProfile } from '~/constants/user'


export default {
  computed: {
    links() {
      const { isLoggedIn, isUserAdmin } = this.$store.state.auth
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
          isShown: isUserAdmin,
        },
        {
          name: 'Профиль',
          to: '/personal-room',
          icon: ['fas', 'user-tie'],
          isShown: isLoggedIn,
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
      const token = this.$apolloHelpers.getToken()
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
        if (email) fetechUserProfile.call(this, email)
        else this.redirectToLoginPage()
      } catch (e) {
        console.error(e)
      }
    },

    redirectToLoginPage() {
      this.$router.push('/login')
    }
  },

  subscriptions() {
    if (!this.$env.canUseDOM) return

    return {
      $escape: fromEvent(document, 'keydown').pipe(
        throttleTime(1000),
        filter(({ keyCode }) => keyCode === 27 && this.$store.state.popups.isPopupOpened),
        map(() => this.$store.commit('popups/closePopups')),
      ),
    }
  },
}
</script>

<style lang="scss">
@import '~/assets/styles/config/_colors.sass';
@import '~/assets/styles/base.scss';
.holder {
  @media (--from-tablet) {
    padding-bottom: 134px;
  }

  @media (--until-tablet) {
    padding-bottom: 94px;
  }
}

header {
  background-image: linear-gradient($red 15%, transparent 0);
}

.mainTitle {
  display: block;
  font-weight: bold;
  padding-top: .5em;
  text-align: center;

  &__link {
    display: block;
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
  z-index: 1000;
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

