<template>
  <div>
    <header>
      <div class="container">
        <h1 class="title">
          <img :src="appLogo" alt="Logo" class="logo">
          БухУчёт
        </h1>
      </div>
    </header>
    <nuxt/>

    <footer>
      <div class="container">
        <nav class="navitaion">
          <ul class="navitaionItems">
            <menu-item
              v-for="({ name, to, icon }, index) in links"
              :key="index"
              :name="name"
              :to="to"
              :icon="icon"
            />
          </ul>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script>
import MenuItem from '~/components/MenuItem'
import appLogo from '~/assets/logo.svg'
export default {
  data() {
    return {
      links: [
        {
          name: 'Главная',
          to: '/',
          icon: ['fas', 'igloo']
        },
        {
          name: 'Статистика',
          to: '/statistics',
          icon: ['fas', 'chart-pie']
        },
        {
          name: 'Войти',
          to: '/login',
          icon: ['fas', 'sign-in-alt']
        },
        {
          name: 'Выйти',
          to: '/logout',
          icon: ['fas', 'sign-out-alt'],
        },
      ],
      appLogo,
    }
  },
  components: {
    MenuItem,
  },
}
</script>

<style>
@import '~/assets/styles/base.scss';

footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
}

.title {
  display: block;
  align-items: center;
}

.logo {
  width: 45px;
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
  padding: 0 0 1em;
  display: flex;
  justify-content: center;
}

</style>

