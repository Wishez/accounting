<template>
  <section v-if="!isUserViewer" class="transactionTypesContainer">
    <h1>Типы транзакций</h1>

    <div class="actions_near litter transaction-types-actions-holder">
      <base-button :action="toggleTransactionTypes" class="action-button" unstyled>
        Посмотреть {{isDeletedShown ? 'действующие' : 'удалённые' }} типы
      </base-button>

      <base-button :action="openTransactionTypePopup" class-name="action-button" unstyled>
        Создать тип транзакции
      </base-button>

      <upload-file-button
        :target="transactionsCreateTarget"
        @upload-started="() => isExcelParserProcessing = true"
        @upload-finished="({ data: processId }) => {
          setCreateTransactionsLoadingState(true)
          makeTransactionsCreateStatusRequest(processId)
          isExcelParserProcessing = false
        }"
        @upload-failure="() => isExcelParserProcessing = false"
      >
        Загрузить excel файл 
      </upload-file-button>

      <loader v-if="isExcelParserProcessing || $apollo.queries.transactionsTypes.loading" />
    </div>

    <div v-if="isCreateTransactionsProcessing || transactionsCreateStatus || isCreateTransactionsFailed" class="litter actions_near">
      <p v-if="isCreateTransactionsProcessing || !$lodash.get(transactionsCreateStatus, 'createdTransactionsIds.length')" class="zero-margin">
        В данный момент сервер занимается созданием транзакций. Это может занять какое-то время.
      </p>
      <p v-else-if="isCreateTransactionsFailed" class="zero-margin">
        Во время создания транзакций что-то пошло не так.
        <base-button :action="refreshPage" class="action-button" unstyled>Обновите страницу</base-button>
      </p>
      <ul v-else-if="transactionsCreateStatus" class="zero-margin">
        <li v-if="transactionsCreateStatus.isDone" class="transaction-done">
          <strong>Операция завершена.</strong>
          <base-button :action="refreshPage" class="action-button" unstyled>Обновите страницу</base-button>
        </li>
        <li v-else class="transaction-done">
          Создание транзакий <strong>в процессе</strong>.
        </li>
        <li>
          Добавленно транзакций: {{transactionsCreateStatus.createdTransactionsIds.length}}
        </li>

        <!-- Эти строчки для дебага -->
        <!-- <li v-if="transactionsCreateStatus.notCreatedTransactionsPayloads.length">
          Не получилось создать транзакций: {{transactionsCreateStatus.notCreatedTransactionsPayloads.length}}
        </li>
        <li v-if="transactionsCreateStatus.notCreatedAccountsNames.length">
          Не получилось создать счета: {{transactionsCreateStatus.notCreatedAccountsNames.length}}
        </li>
        <li v-if="transactionsCreateStatus.notCreatedTransactionsTypesNames.length">
          Не получилось создать типов транзакции: {{transactionsCreateStatus.notCreatedTransactionsTypesNames.length}}
        </li> -->
      </ul>
    </div>

    <ul v-if="$lodash.get(transactionsTypes, 'length', 0)" class="transactionTypes">
      <li v-for="({ id, name, color, slug, isDeleted }, index) in transactionsTypes" :key="index">
        <base-button :action="editTransactionType({ id, name, color, slug, isDeleted })" class-name="transactionType" :style="`border-color:${color}`">
          {{name}}
        </base-button>
      </li>
    </ul>
    <p v-else-if="!$apollo.queries.transactionsTypes.loading" class="litter">Нет {{isDeletedShown ? 'удалённых' : 'созданных'}} типов</p>

    <modal-container :onClose="refetchTransactionTypes" :isShown="$store.state.popups[transactionTypePopupName]">
      <transaction-type-form />
    </modal-container>
  </section>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { popupsNames } from '~/constants/popups'
import { getTransactionsTypesGql } from '~/constants/gql'
import { apiUrls } from '~/constants/apiUrls'
import { ModalContainer, TransactionTypeForm } from '~/components'
import UploadFileButton from './UploadFileButton'

const transactionTypePopupName = popupsNames.TRANSACTION_TYPE

export default {
  name: "TransactionTypes",
  components: {
    TransactionTypeForm,
    ModalContainer,
    UploadFileButton,
  },

  apollo: {
    transactionsTypes: {
      query: getTransactionsTypesGql,
      update({ transactionsTypes = {} }) {
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      },

      fetchPolicy: 'network-only',
    },
  },

  computed: {
    ...mapState('auth', [
      'isUserViewer'
    ]),

    ...mapState('transactions', [
      'isCreateTransactionsProcessing',
      'isCreateTransactionsFailed',
      'transactionsCreateStatus',
    ]),
  },

  mounted() {
    const { processId } = localStorage
    if (processId) {
      this.setCreateTransactionsLoadingState(true)
      this.makeTransactionsCreateStatusRequest(processId)
    }
  },

  data: () => ({
    transactionTypePopupName,
    transactionsCreateTarget: apiUrls.transactionsCreate,
    isDeletedShown: false,
    isExcelParserProcessing: false,
  }),

  methods: {
    ...mapActions('transactions', ['makeTransactionsCreateStatusRequest']),
    ...mapMutations('transactions', ['setCreateTransactionsLoadingState']),

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

    refreshPage() {
      window.location.reload()
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
  },
}
</script>

<style lang="scss" scoped>
.transaction-done {
  margin-bottom: 9px;
}

.transaction-types-actions-holder {
  position: relative;
}

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