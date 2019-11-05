<template>
  <div :class="{
    'statistics-holder': true,
    'statistics-holder_litter': hasLitter,
    'statistics-holder_fadeOut': isFadeOut,
    'statistics-holder_wrap-fields': !isReadOnly,
    [className]: className, 
  }">
    <div class="statistics-container">
      <label for="profit-statistics" :class="modifier">Приход:</label>
      <input
        v-model="totalProfit"
        v-money="money"
        id="profit-statistics"
        :class="modifier"
        :readOnly="isReadOnly"
      />
    </div>

    <div class="statistics-container">
      <label for="consumption-statistics" :class="modifier">Расход:</label>
      <input
        v-model="totalConsumption"
        v-money="money"
        id="consumption-statistics"
        class="consumption"
        :class="modifier"
        :readOnly="isReadOnly"
      />

    </div>

    <div class="statistics-container">
      <label for="balance-statistics" :class="modifier">{{isBalance  ? 'Баланс:' : 'Сальдо:'}}</label>
      <input
        v-model="totalBalance"
        v-money="money"
        id="balance-statistics"
        class="balance"
        :class="modifier"
        :readOnly="isReadOnly"
      />
    </div>

    <span v-if="!isReadOnly" class="accept-action">
      <base-button class="action-button" :action="calcBalance" unstyled>
        Расчитать сальдо
      </base-button>
    </span>
  </div>
</template>

<script>
import { moneyConfig } from '~/constants/config'
import { fromEvent } from 'rxjs'
import { map, pluck } from 'rxjs/operators'

export default {
  name: "BaseStatistics",
  props: {
    profit: {
      type: [Number, String],
      default: 0,
    },
    consumption: {
      type: [Number, String],
      default: 0,
    },
    balance: {
      type: [Number, String],
      default: 0,
    },
    className: String,
    hasLitter: Boolean,
    isReadOnly: {
      type: Boolean,
      default: true,
    },
    isFadeOut: Boolean,
    isBalance: Boolean,
  },

  computed: {
    modifier() {
      return this.isReadOnly ? '' : 'edit-mode'
    }
  },
  
  data: () => ({
    money: moneyConfig,
    totalConsumption: 0,
    totalBalance: 0,
    totalProfit: 0,
  }),

  mounted() {
    this.totalConsumption = parseFloat(this.consumption).toFixed(2)
    this.totalBalance = parseFloat(this.balance).toFixed(2)
    this.totalProfit = parseFloat(this.profit).toFixed(2)
  },

  methods: {
    emitEvent(fieldName, value) {
      this.$emit(`${fieldName}-input`, value)
    },

    subscribe(fieldName, eventName) {
      return this.$watchAsObservable(fieldName).pipe(
        pluck('newValue'),
        map((value) => {
          const sum = this.$lodash.getNumberFromMoney(value)
          this.emitEvent(eventName, sum)
          return value
        })
      )
    },

    calcBalance() {
      const { getNumberFromMoney } = this.$lodash
      const consumption = getNumberFromMoney(this.totalConsumption)
      const profit = getNumberFromMoney(this.totalProfit)
      const balance = getNumberFromMoney(this.totalBalance)
      this.totalBalance = (balance - consumption + profit).toFixed(2)
    }
  },

  subscriptions() {
    if (!this.$env.canUseDOM || this.isReadOnly) return {}
    return {
      profit$: this.subscribe('totalProfit', 'profit'),
      balance$: this.subscribe('totalBalance', 'balance'),
      consumption$: this.subscribe('totalConsumption', 'consumption'),
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/config/_colors.sass';
@import '~/assets/styles/config/_easing.sass';

.accept-action {
  margin-top: -1.5em;
  display: block;
  margin-bottom: 2.8em;
  font-size: .8em;

  button {
    margin-right: 0;
    &:hover {
      color: $red;
      border-bottom-color: $red;
    }
  }
}

p {
  margin-bottom: 0
}

.statistics-holder  {
  max-width: 100%;
  position: relative;
  text-align: left;
  transition: opacity 200ms $standart;
  will-change: opacity;
  opacity: 1;

  &_wrap-fields {

    .statistics-container {
      flex-wrap: wrap;
    }
  }

  &_fadeOut {
    opacity: 0;
  }

  &_litter {
    padding: 1em;
    width: calc(33.33% - 18px);
    margin-left: 18px;
    background-color: $darkGray;
    color: $white;
    z-index: 3;

    @media (--until-tablet) {
      width: 100%;
    }

    input {
      color: inherit;
    }
  }
}

label {
  white-space: nowrap;
}

input:not(.edit-mode) {
  padding: 0;
  padding-left: .25em;
  margin: 0;
  background-color: transparent;
  border: 0;
  font-size: 16px;
}

.statistics-container {
  display: flex;
  align-items: center;
}
</style>