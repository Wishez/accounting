import { popupsNames } from "~/constants/popups"

export const state = () => ({
  [popupsNames.ACCOUNT]: false,
  [popupsNames.TRANSACTION]: false,
  [popupsNames.TRANSACTION_TYPE]: false,
  [popupsNames.USER]: false,
  payload: {},
  isPopupOpened: false,
})

export const mutations = {
  closePopups(state) {
    Object.keys(state).forEach(popupName => {
      const isOpened = state[popupName] === true
      if (isOpened) state[popupName] = false
    })
    state.isPopupOpened = false
  },

  switchPopupState(state, { isOpened, popupName }) {
    state[popupName] = isOpened;
    state.isPopupOpened = isOpened
  },

  setPopupPayload(state, { popupName, payload }) {
    state.payload[popupName] = payload
  },

  clearPopupPayload(state) {
    state.payload = {}
  },
}

export const actions = {
  openPopup({ commit }, popupName) {
    commit('closePopups')
    commit('switchPopupState', {
      isOpened: true,
      popupName,
    })    
  }
}
