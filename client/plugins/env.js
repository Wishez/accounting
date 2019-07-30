import Vue from 'vue'

Vue.prototype.$env = {
  canUseDOM: Boolean(typeof window !== 'undefined' && window.document && window.document.createElement)
}