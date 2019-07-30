<template>
  <section class="litter">
    <h1>Фильтр</h1>

    <div class="fields">
      <div class="datepicker-holder">
        <base-dropdown
          :options="transactionsTypes"
          @selected="validateSelection"
          placeholder="Тип транзакции"
        />

        <span class="clear-action-holder">
          <base-button :action="clearType" unstyled>
            <fa-icon :icon="['fas', 'times']" />
          </base-button>
        </span>
      </div>
      

      <no-ssr>
        <div class="datepicker-holder">
          <VueDatePicker
            v-model="date"
            id="date"
            name="date"
            :locale="localeCalender"
            color="#de1f24"
            buttonCancel="Отмена"
            placeholder="Месяц года"
            @onChange="onChangeDate"
            type="month"
            noHeader
            fullscreenMobile
          />

          <span class="clear-action-holder">
            <base-button :action="clearDate" unstyled>
              <fa-icon :icon="['fas', 'times']" />
            </base-button>
          </span>
        </div>
      </no-ssr>

      <base-button :action="clearFilter">Очистить</base-button>
    </div>
  </section>
</template>

<script>
import { getTransactionsTypesGql } from '~/constants/gql'
import { localeCalender } from '~/constants/date'
console.log('localeCalender', localeCalender)
export default {
  name: "AccountFilter",
  apollo: {
    transactionsTypes: {
      query: getTransactionsTypesGql,

      update({ transactionsTypes }) {
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      }
    },
  },
  data: () => ({
    date: undefined,
    localeCalender,
  }),
  methods: {
    changeFilter(filterKey, payload) {
      this.$store.commit('accountFilter/changeFilter', {
        filterKey,
        payload,
      })
      this.$emit('change', payload)
    },
    validateSelection(selection) {
      this.changeFilter('type', selection)
    },

    onChangeDate() {
      this.changeFilter('date', this.date)
    },

    clearFilter() {
      this.clearDate()
      this.clearType()
    },
    
    clearDate() {
      this.date = undefined
      this.changeFilter('date')
    },

    clearType() {
      this.changeFilter('type', {})
    }
  },
  beforeCreate() {},
  created() {
    const { date } = this.$store.state.accountFilter
    this.date = date ? new Date(date) : date
  },
}
</script>

<style lang="scss" scoped>
.datepicker-holder {
  width: 100%;
  position: relative;

  svg[data-icon="calendar-alt"] {
    display: none;
  }
}

.clear-action-holder {
  position: absolute;
  top: 20%;
  right: 0;

  svg {
    font-size: 2em;
  }
}
</style>