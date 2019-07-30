<template>
  <section>
    <h1>Типы транзакций</h1>
    <ul v-if="(transactionsTypes || []).length" class="transactionTypes">
      <li v-for="({ id, name, color, slug }, index) in transactionsTypes" :key="index">
        <base-button :action="editTransactionType({ id, name, color, slug })" class-name="transactionType" :style="setTransactionTypeButtonStyle(color)">
          {{name}}
        </base-button>
      </li>
    </ul>
    <loader v-else-if="this.$apollo.queries.transactionsTypes.loading" />
    <p v-else>Нет доступных типов</p>

    <modal-container :onClose="() => $apollo.queries.transactionsTypes.refetch()" :isShown="$store.state.popups[transactionTypePopupName]">
      <transaction-type-form />
    </modal-container>
  </section>
</template>

<script>
import { popupsNames } from '~/constants/popups'
import { getTransactionsTypesGql } from '~/constants/gql'
import { ModalContainer, TransactionTypeForm } from '~/components'

const transactionTypePopupName = popupsNames.TRANSACTION_TYPE

export default {
  name: "TransactionTypes",
  components: {
    TransactionTypeForm,
    ModalContainer,
  },

  apollo: {
    transactionsTypes: {
      query: getTransactionsTypesGql,
      update({ transactionsTypes }) {
        return transactionsTypes.data
      }
    },
  },
  data: () => ({
    transactionTypePopupName,
  }),

  methods: {

    openTransactionTypePopup() {
      this.$store.dispatch('popups/openPopup', transactionTypePopupName)
    },

    editTransactionType(transactionType) {
      return () => {
        this.$store.commit('popups/setPopupPayload', {
          popupName: transactionTypePopupName,
          payload: transactionType,
        })
        this.openTransactionTypePopup()
      }
    },

    setTransactionTypeButtonStyle(backgroundColor) {
      const { hue } = this.$lodash.getHslFromHex(backgroundColor)
      const color = hue > 127 || hue === 0 ? '#fff' : '#333'
      return `background-color:${backgroundColor};color:${color}`
    }
  }
}
</script>

<style lang="scss" scoped>
.transactionTypes {
  display: flex;
  margin: 0 -.5em 1em;
}

.transactionType {
  margin: 0 .5em 1em;
}
</style>