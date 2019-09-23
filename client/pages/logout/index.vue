<template>
  <h1>Выходим...</h1>
</template>

<script>
export default {
  async beforeMount() {
    const { commit } = this.$store
    await this.$apolloHelpers.onLogout()
    commit('auth/setLoggedInState', false)
    commit('auth/setLoggedOutState')
    this.$router.push('/login')
  }
}
</script>