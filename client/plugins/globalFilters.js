import Vue from "vue";
import { formatDate } from './lodash'
import accounting from './accounting'

Vue.filter(
  "fixSum",
  (sum, numbersAfterDot = 2) =>
    typeof sum === "string" ? sum : +sum.toFixed(numbersAfterDot)
);

Vue.filter(
  'formatMoney',
  (value, currency = '₽', precision = 2, thousands = ' ' , decimals = ',', format = '%v %s') => accounting.formatMoney(value, currency, precision, thousands, decimals, format)
)


Vue.filter("formatDate", formatDate);
