export const state = () => ({
  isLoggedIn: false,
  user: {},
  isUserAdmin: false,
})

export const mutations = {
  setLoggedInState(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn
  },
  setCurrentProfile(state, userProfile) {
    state.user = userProfile
  },
  setAdminPrivilege(state, isUserAdmin) {
    state.isUserAdmin = isUserAdmin
  },
  setLoggedOutState(state) {
    state.user = {}
    state.isUserAdmin = false
  }
}