<template>
  <div :class="{
    'statistics-holder': true,
    'statistics-holder_litter': hasLitter, 
    'statistics-holder_form': !isReadOnly,
    'statistics-holder_fadeOut': isFadeOut,
  }">
    <div class="statistics-container">
      <label for="profit-statistics">Приход:</label>
      <input
        v-model="profit"
        v-money="money"
        id="profit-statistics"
        class="profit"
        :readOnly="isReadOnly"
      />
    </div>

    <div class="statistics-container">
      <label for="consumption-statistics">Расход:</label>
      <input
        v-model="consumption"
        v-money="money"
        id="consumption-statistics"
        class="consumption"
        :readOnly="isReadOnly"
      />

    </div>

    <div class="statistics-container">
      <label for="balance-statistics">{{this.accountBalance ? 'Баланс:' : 'Сальдо:'}}</label>
      <input
        v-model="balance"
        v-money="money"
        id="balance-statistics"
        class="balance"
        :readOnly="isReadOnly"
      />
    </div>

    <span v-if="!isReadOnly" class="accept-action">
      <base-button :action="calcBalance" unstyled>
        <fa-icon :icon="['fas', 'check-circle']" />
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
  computed: {
    statistics() {
      const { transactions } = this
      const statistics = this.transactions.reduce((result, transaction) => {
        const { balance = 0, profit = 0, consumption = 0 } = transaction

        return {
          profit: (Number(result.profit) + Number(profit)).toFixed(2),
          consumption: (Number(result.consumption) + Number(consumption)).toFixed(2),
        }
      }, {
        profit: 0.00,
        consumption: 0.00,
      })

      statistics.balance = Number(this.$lodash.get(transactions, '0.balance', 0)).toFixed(2)
      return statistics
    },
  },
  props: {
    transactions: {
      type: Array,
      required: true,
    },
    hasLitter: Boolean,
    isReadOnly: {
      type: Boolean,
      default: true,
    },
    isFadeOut: Boolean,
    accountBalance: [String, Number],
  },
  data: () => ({
    money: moneyConfig,
    profit: 0,
    consumption: 0,
    balance: 0,
  }),

  mounted() {
    ['profit', 'consumption'].forEach(key => {
      this[key] = this.statistics[key]
    })

    this.balance = this.accountBalance || this.statistics.balance
  },

  methods: {
    emitEvent(fieldName, value) {
      this.$emit(`${fieldName}-input`, value)
    },

    subscribe(fieldName, callback) {
      return this.$watchAsObservable(fieldName).pipe(
        pluck('newValue'),
        map((value) => {
          const sum = this.$lodash.getNumberFromMoney(value)
          this.emitEvent(fieldName, sum)
          if (callback) callback(sum)
          return value
        })
      )
    },

    calcBalance() {
      const { getNumberFromMoney } = this.$lodash
      const consumption = getNumberFromMoney(this.consumption)
      const profit = getNumberFromMoney(this.profit)
      const balance = getNumberFromMoney(this.balance)
      this.balance = (balance - consumption + profit).toFixed(2)
    }
  },

  subscriptions() {
    if (!this.$env.canUseDOM || this.isReadOnly) return {}
    return {
      profit$: this.subscribe('profit'),
      balance$: this.subscribe('balance'),
      consumption$: this.subscribe('consumption'),
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/config/_colors.sass';
@import '~/assets/styles/config/_easing.sass';

.accept-action {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-100%);


  svg {
    font-size: 2em;
    transition: 200ms $standart;

    &:hover {
      color: $red;
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

  &_fadeOut {
    opacity: 0;
  }

  &_litter {
    padding: 1em;
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

  &_form {
    margin-bottom: 1.5em;

    .statistics-container {
      margin-bottom: 1em;
    }
  }
}

label {
  white-space: nowrap;
}

input {
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