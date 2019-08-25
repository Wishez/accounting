<template>
  <section class="transactionTypesContainer">
    <h1>Типы транзакций</h1>

    <div class="actions_near">
      <base-button :action="toggleTransactionTypes" class="action-button" unstyled>
        Посмотреть {{isDeletedShown ? 'действующие' : 'удалённые' }} типы
      </base-button>
    </div>

    <ul v-if="$lodash.get(transactionsTypes, 'length', 0)" class="transactionTypes">
      <li v-for="({ id, name, color, slug, isDeleted }, index) in transactionsTypes" :key="index">
        <base-button :action="editTransactionType({ id, name, color, slug, isDeleted })" class-name="transactionType" :style="setTransactionTypeButtonStyle(color)">
          {{name}}
        </base-button>
      </li>
    </ul>
    <loader v-else-if="this.$apollo.queries.transactionsTypes.loading" />
    <p v-else>Нет {{isDeletedShown ? 'удалённых' : 'созданных'}} типов</p>

    <modal-container :onClose="refetchTransactionTypes" :isShown="$store.state.popups[transactionTypePopupName]">
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
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      }
    },
  },

  data: () => ({
    transactionTypePopupName,
    isDeletedShown: false
  }),

  methods: {
    toggleTransactionTypes() {
      this.isDeletedShown = !this.isDeletedShown
      this.refetchTransactionTypes()
    },

    refetchTransactionTypes() {
      this.$apollo.queries.transactionsTypes.refetch({
        isDeletedShown: this.isDeletedShown,
      })
    },

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
      const { hue, luminosity } = this.$lodash.getHslFromHex(backgroundColor)
      const color = hue > 127 || (hue === 0 && luminosity !== 100) ? '#fff' : '#333'
      return `background-color:${backgroundColor};color:${color}`
    }
  }
}
</script>

<style lang="scss" scoped>
.transactionTypes {
  margin: 0 -.5em 1em;
  display: flex;
  flex-wrap: wrap;
}

.transactionType {
  margin: 0 .5em 1em;
}

.transactionTypesContainer {
  min-height: 151px;
}
</style>