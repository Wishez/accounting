import Vue from 'vue'
import { PasswordField, Loader, BaseField, SlugField, BaseButton, BaseStatistics, BaseDropdown } from '~/components'

Vue.component('loader', Loader)
Vue.component('base-button', BaseButton)
Vue.component('base-statistics', BaseStatistics)
Vue.component('slug-field', SlugField)
Vue.component('base-field', BaseField)
Vue.component('base-dropdown', BaseDropdown)
Vue.component('password-field', PasswordField)

import {VMoney} from 'v-money'
Vue.directive('money', VMoney)
