export const state = () => ({
  date: undefined,
  type: {},
  category: '',
})

export const mutations = {
  changeFilter(state, { filterKey, payload }) {
    state[filterKey] = payload
  }
} 