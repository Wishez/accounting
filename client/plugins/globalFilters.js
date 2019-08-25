import Vue from "vue";
import { formatDate } from './lodash'

Vue.filter(
  "fixSum",
  (sum, numbersAfterDot = 2) =>
    typeof sum === "string" ? sum : +sum.toFixed(numbersAfterDot)
);


Vue.filter("formatDate", formatDate);
