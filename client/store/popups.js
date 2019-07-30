import { popupsNames } from "~/constants/popups"

export const state = () => ({
  [popupsNames.ACCOUNT]: false,
  [popupsNames.TRANSACTION]: false,
  [popupsNames.TRANSACTION_TYPE]: false,
  payload: {},
})

export const mutations = {
  closePopups(state) {
    Object.keys(state).forEach(popupName => {
      const isOpened = state[popupName] === true
      if (isOpened) state[popupName] = false
    })
  },

  switchPopupState(state, { isOpened, popupName }) {
    state[popupName] = isOpened;
  },

  setPopupPayload(state, { popupName, payload }) {
    state.payload[popupName] = payload
  },

  clearPopupPayload(state) {
    state.payload = {}
  }
}

export const actions = {
  openPopup({ commit }, popupName) {
    commit('closePopups')
    commit('switchPopupState', {
      isOpened: true,
      popupName,
    })    
  }
//   closeNotificationPopup({ commit }) {
//     commit("switchPopupState", {
//       isOpened: false,
//       popupName: popupsNames.notification
//     });

//     commit("authorization/cleanRequestState", null, { root: true });
//   },

//   openNotificationPopupWithMessage({ commit }) {
//     commit("switchPopupState", {
//       isOpened: true,
//       popupName: popupsNames.notification
//     })
//   },
}
