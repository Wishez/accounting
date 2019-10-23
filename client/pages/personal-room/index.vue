<template>
  <section v-if="isLoggedIn" class="container personal-room">
    <form>
      <h1>Профиль</h1>
      <p>Ваша роль: <strong>{{RolesMap[user.role]}}</strong></p>
      <p>Аккаунт создан: <strong>{{new Date(user.dateJoined) | formatDate('DD MMMM YYYYг.')}}</strong></p>
    </form>

    <user-form isEdit />
      
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { RolesMap } from '~/constants/user'
import { UserForm } from '~/components'
import { updateProfileGql } from '~/constants/gql'

export default {
  name: "personal-room",
  components: {
    UserForm,
  },
  data: () => ({
    RolesMap
  }),
  computed: mapState('auth', ['user', 'isLoggedIn']),
}
</script>

<style lang="scss" scoped>
p:last-child {
  margin: 0;
}
</style>