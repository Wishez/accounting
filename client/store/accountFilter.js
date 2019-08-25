export const state = () => ({
  untilDate: undefined,
  sinceDate: undefined,
  type: {},
})

export const mutations = {
  changeFilter(state, { filterKey, payload }) {
    state[filterKey] = payload
  }
} 