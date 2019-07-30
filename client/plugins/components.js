import Vue from 'vue'
import { Loader, BaseField, SlugField, BaseButton, BaseStatistics, BaseDropdown } from '~/components'

Vue.component('loader', Loader)
Vue.component('base-button', BaseButton)
Vue.component('base-statistics', BaseStatistics)
Vue.component('slug-field', SlugField)
Vue.component('base-field', BaseField)
Vue.component('base-dropdown', BaseDropdown)

import {VMoney} from 'v-money'
Vue.directive('money', VMoney)
