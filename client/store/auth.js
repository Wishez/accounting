export const state = () => ({
  isLoggedIn: false,
  user: {},
})

export const mutations = {
  setLoggedInState(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn
  },
  setCurrentProfile(state, userProfile) {
    state.user = userProfile
  },
}