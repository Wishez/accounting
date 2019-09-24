<template>
  <section v-if="!auth.isUserViewer" class="transactionTypesContainer">
    <h1>Типы транзакций</h1>

    <div class="actions_near">
      <base-button :action="toggleTransactionTypes" class="action-button" unstyled>
        Посмотреть {{isDeletedShown ? 'действующие' : 'удалённые' }} типы
      </base-button>

      <base-button :action="openTransactionTypePopup" class-name="action-button" unstyled>
        Создать тип транзакции
      </base-button>
    </div>

    <ul v-if="$lodash.get(transactionsTypes, 'length', 0)" class="transactionTypes">
      <li v-for="({ id, name, color, slug, isDeleted }, index) in transactionsTypes" :key="index">
        <base-button :action="editTransactionType({ id, name, color, slug, isDeleted })" class-name="transactionType" :style="`border-color:${color}`">
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
      update({ transactionsTypes = {} }) {
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      }
    },
  },

  computed: {
    auth() {
      return this.$store.state.auth
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
  }
}
</script>

<style lang="scss" scoped>

.transactionTypes {
  margin: 0 -.5em 1em;
  display: flex;
  flex-wrap: wrap;

  button {
    background-color: white;
    box-shadow: 0 0 10px rgba(#333, .5);
    color: rgb(51, 51, 51);
    border-radius: 2px;
    border-style: solid;
    border-top-width: 3px;
    border-bottom-width: 3px;
  }
}

.transactionType {
  margin: 0 .5em 1em;
}

.transactionTypesContainer {
  min-height: 151px;
}
</style>