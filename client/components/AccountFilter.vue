<template>
  <section class="litter">
    <h1>Фильтр</h1>

    <div v-if="!queryType || defaultValue" class="fields">
      <div class="datepicker-holder">
        <base-dropdown
          :options="types"
          :defaultValue="defaultValue"
          @selected="validateSelection"
          placeholder="Тип транзакции"
          :filterValue="$store.state.accountFilter.type"
          withFilter
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
            v-model="sinceDate"
            id="sinceDate"
            name="sinceDate"
            color="#de1f24"
            buttonCancel="Отмена"
            placeholder="Месяц (От)"
            @onChange="onChangeDate('sinceDate')"
            type="month"
            noHeader
            fullscreenMobile
          />

          <span class="clear-action-holder">
            <base-button :action="clearDate('sinceDate')" unstyled>
              <fa-icon :icon="['fas', 'times']" />
            </base-button>
          </span>
        </div>

        <div class="datepicker-holder">
          <VueDatePicker
            v-model="untilDate"
            id="untilDate"
            name="untilDate"
            color="#de1f24"
            buttonCancel="Отмена"
            placeholder="Месяц (По)"
            @onChange="onChangeDate('untilDate')"
            type="month"
            noHeader
            fullscreenMobile
          />

          <span class="clear-action-holder">
            <base-button :action="clearDate('untilDate')" unstyled>
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

export default {
  name: "AccountFilter",
  apollo: {
    transactionsTypes: {
      query: getTransactionsTypesGql,

      update({ transactionsTypes = {} }) {
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      },

      skip() {
        return Boolean(this.accountCategories)
      }
    },
  },

  props: {
    accountCategories: Array,
  },

  computed: {
    types() {
      return this.accountCategories || this.transactionsTypes
    },

    queryType() {
      return this.$route.query.type
    },

    defaultValue() {
      const defaultType = this.queryType
      return this.types.find(({ slug }) => slug === defaultType)
    }
  },

  data: () => ({
    untilDate: undefined,
    sinceDate: undefined,
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

    onChangeDate(dateFieldName) {
      this.changeFilter(dateFieldName, this[dateFieldName])
    },

    clearFilter() {
      this.clearType()
      this.clearDate('untilDate')()
      this.clearDate('sinceDate')()
    },
    
    clearDate(dateFieldName) {
      return () => {
        this[dateFieldName] = undefined
        this.changeFilter(dateFieldName)
      }
    },

    clearType() {
      this.changeFilter('type', {})
    }
  },

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