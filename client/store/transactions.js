import axios from 'axios'
import { apiUrls } from '~/constants/apiUrls'

export const state = () => ({
  isCreateTransactionsProcessing: false,
  isCreateTransactionsFailed: false,
  transactionsCreateStatus: null,
})

export const mutations = {
  setCreateTransactionsLoadingState(state, isLoading) {
    state.isCreateTransactionsProcessing = isLoading
  },

  setTransactionsCreateStatus(state, transactionsCreateStatus) {
    state.isCreateTransactionsProcessing = false
    state.transactionsCreateStatus = transactionsCreateStatus
  },

  setTransactionsCreateFailed(state, isFailed = true) {
    state.isCreateTransactionsProcessing = false
    state.isCreateTransactionsFailed = isFailed
  },
}

export const actions = {
  async makeTransactionsCreateStatusRequest({ commit, dispatch }, processId) {
    localStorage.processId = processId
    const result = await axios.get(apiUrls.transactionCreateStatus, { params: { processId } })
      .then(({ data: getResponse }) => getResponse.data)
      .catch(() => commit('setTransactionsCreateFailed'))
    
    if (result) {
      commit('setTransactionsCreateStatus', result)

      if (!result.isDone) setTimeout(() => dispatch('makeTransactionsCreateStatusRequest', processId), 10000)
      else localStorage.processId = ''
    }
  },
}
