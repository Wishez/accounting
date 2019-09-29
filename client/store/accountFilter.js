export const state = () => ({
  untilDate: undefined,
  sinceDate: undefined,
  filterType: {},
})

export const mutations = {
  changeFilter(state, { filterKey, payload }) {
    state[filterKey] = payload
  }
} 