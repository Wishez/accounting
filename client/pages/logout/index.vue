<template>
  <h1>Выходим...</h1>
</template>

<script>
export default {
  beforeMount() {
    this.$cookies.remove('access_token')
    this.$cookies.remove('refresh_token')
    this.$store.commit('auth/setLoggedInState', false)
    this.$store.commit('auth/setLoggedOutState')
    this.$apolloHelpers.onLogout()
    this.$router.push('/login')
  }
}
</script>