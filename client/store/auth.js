import { Roles } from '~/constants/user'

export const state = () => ({
  isLoggedIn: false,
  user: {},
  isUserAdmin: false,
  isUserViewer: true,
})

export const mutations = {
  setLoggedInState(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn
  },
  setCurrentProfile(state, userProfile) {
    state.user = userProfile
    state.isUserAdmin = userProfile.role === Roles.ADMIN
    state.isUserViewer = userProfile.role === Roles.VIEWER
  },
  
  setLoggedOutState(state) {
    state.user = {}
    state.isUserAdmin = false
    state.isUserViewer = true
  }
}