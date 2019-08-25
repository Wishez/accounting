<template>
  <section v-if="authState.isLoggedIn" class="container">
    <h1>Профиль</h1>

    <form>
      <p>Ваша роль: <strong>{{RolesMap[user.role]}}</strong></p>
      <p>Аккаунт создан: <strong>{{new Date(user.dateJoined) | formatDate('DD MMMM YYYYг.')}}</strong></p>
    </form>

    <user-form isEdit />
      
  </section>
</template>

<script>
import { RolesMap } from '~/constants/user'
import { UserForm } from '~/components'
import { updateProfileGql } from '~/constants/gql'

export default {
  name: "personal-room",
  components: {
    UserForm,
  },
  filters: {},
  data: () => ({
    RolesMap
  }),
  computed: {
    authState() {
      return this.$store.state.auth
    },

    user() {
      return this.authState.user
    },
  },
}
</script>

<style lang="scss" scoped>
p:last-child {
  margin: 0;
}
</style>