<template>
  <div class="container">
    <div class="actions">
      <base-button :action="openTransactionPopup" class="action-button" unstyled>Создать транзакцию</base-button>
      <base-button :action="openTransactionTypePopup" class="action-button" unstyled>Создать тип транзакции</base-button>
    </div>

    <transaction-types />

    <account-filter :accountCategories="accountCategories" @change="updateCategories" />

    <section class="account-container">
      <div class="accountHeader">
        <h1 class="accountHeader__title">
          {{$lodash.get(account, 'name')}}
        
          <div v-if="sinceDate && untilDate" class="transactions-period">
            От <strong>{{sinceDate | formatDate('DD MMMM YYYY')}}</strong> 
            по <strong>{{untilDate | formatDate('DD MMMM YYYY')}}</strong>
          </div>
        </h1>

        <div class="actions">
          <base-button :action="toggleTransactions" class="action-button" unstyled>
            {{isDeletedTransactionsShown ? 'Действующие' : 'Удалённые'}} транзакиции
          </base-button>
        </div>

        <base-statistics hasLitter :key="updateCount" :transactions="this.statistics" :accountBalance="accountBalance" />
      </div>

      <ul v-if="categories.length" class="account-transactions-categories">
        <li v-for="({ date, name, transactions }, index) in categories" :key="index + updateCount" class="account-transactions-category litter">
          <h2>{{date | formatDate('DD MMMM YYYY')}}</h2>
          
          <div v-for="({ items, typeName }, index) in Object.values(transactions)" :key="index + updateCount">
            <h3>{{typeName}}</h3>

            <div class="account-transactions-header">
              <span class="head head_category">Категория</span>
              <span class="head head_branch" >Филиал</span>
              <span class="head head_note">Примичание</span>
              <span class="head head_statistics">Статистика</span>
            </div>
            <ul class="account-transactions-list">
              <li v-for="(transaction, index) in items" :key="index + updateCount" class="account-transaction-item">
                <base-button class="account-transaction" :action="editTransaction(transaction)" unstyled>
                  <h3>{{transaction.category}}</h3>
                  <span>{{transaction.branch}}</span>
                  <span>{{transaction.note}}</span>
                  <span><base-statistics :transactions="[transaction]" /></span>
                </base-button>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <loader v-else-if="$apollo.queries.account.loading" />

      <p v-if="!categories.length" class="litter">
        <span v-if="!filter.date && !filter.type.id">На счету нет транзакиций</span>
        <span v-else-if="filter.type.name && !filter.date">Нет транзакций с типом «{{filter.type.name}}»</span>
        <span v-else-if="!filter.type.name && filter.date">Нет транзакций созданных {{filter.date | formatDate('MM.YYYY')}}</span>
        <span v-else>Нет транзакций с типом «{{filter.type.name}}» созданных {{filter.date | formatDate('MM.YYYY')}}</span>
      </p>

      <p v-if="$apollo.queries.account.error || $apollo.queries.transactionType.error" class="error">
        {{errorMessage}}
      </p>
    </section>

    <modal-container :onClose="refetchTransactions" :isShown="$store.state.popups[transactionPopupName]">
      <transaction-form />
    </modal-container>
  </div>
</template>

<script>
import { popupsNames } from '~/constants/popups'
import { getAccountGql, getTransactionTypeGql } from '~/constants/gql'
import { ModalContainer, TransactionForm, TransactionTypes, AccountFilter } from '~/components'
import { pluck, map } from 'rxjs/operators'

const { TRANSACTION: transactionPopupName } = popupsNames
export default {
  name: 'AccountPages',

  apollo: {
    account: {
      query: getAccountGql,

      variables() {
        return {
          slug: this.$route.params.slug,
        }
      },

      update({ account }) {
        return account.isSuccess ? account.data : {}
      } 
    },

    transactionType: {
      query: getTransactionTypeGql,

      variables() {
        return {
          slug: this.$route.query.type,
        }
      },

      update({ transactionType }) {
        return transactionType.isSuccess ? transactionType.data : {}
      },

      skip() {
        return !this.$route.query.type
      }
    },
  },

  components: {
    ModalContainer,
    TransactionForm,
    TransactionTypes,
    AccountFilter,
  },

  data: () => ({
    transactionPopupName,
    errorMessage: '',
    isError: false,
    updateCount: 0,
    categories: [],
    accountBalance: 0,
    statistics: [],
    accountCategories: [],
    isDeletedTransactionsShown: false,
    sinceDate: undefined,
    untilDate: undefined,
  }),

  computed: {
    transactionTypeId() {
      return this.$lodash.get(this, 'transactionType.id')
    },
    filter() {
      return this.$store.state.accountFilter
    }
  },

  methods: {
    toggleTransactions() {
      this.isDeletedTransactionsShown = !this.isDeletedTransactionsShown
      this.refetchTransactions()
    },

    refetchTransactions() {
      this.$apollo.queries.account.refetch({
        isDeletedTransactionsShown: this.isDeletedTransactionsShown,
      })
    },
  
    updateCategories() {
      const { get } = this.$lodash
      const { transactionTypeId, account = {} } = this
      const { sinceDate, untilDate, type: filterType } = this.filter
      const { id: filterTypeId } = filterType
      const hasRangePeriod = sinceDate && untilDate
      const isDateInRange = this.$lodash.isDateInRange(untilDate, sinceDate)
      const categories = Object.values(get(account, 'transactions', []).reduce((result, transaction) => {
        const { category, type, date } = transaction
        const typeId = type.id
        console.log(date, isDateInRange(date))
        if ((filterTypeId && typeId !== filterTypeId) || !isDateInRange(date)) return result

        const transactionsMemorized = get(result, `${date}.transactions`, {}) 
        const itemsTyped = get(transactionsMemorized, `${typeId}.items`, []) 
        const transactions = {
          ...transactionsMemorized,
          [typeId]: {
            typeName: type.name,
            items: [
              ...itemsTyped,
              transaction,
            ],
          },
        }
        return {
          ...result,
          [date]: {
            typeId,
            date,
            transactions,
          },
        }
      }, {}))

      const { transactions = [] } = account
      const lastTransaction = transactions[0]
      
      this.accountBalance = Number(get(lastTransaction, 'balance', 0)).toFixed(2)
      this.accountCategories = Object.values(transactions.reduce((result, { type }) => {
        const { name, id, slug } = type
        return {
          ...result,
          [id]: {
            name,
            id,
            slug,
          }
        }
      }, {}))

      if (categories.length) {
        this.setStatistics(categories)
        this.setPeriod(categories)
      } else {
        this.sinceDate = undefined
        this.untilDate = undefined
        this.statistics = []
      }

      this.categories = categories
    },

    setPeriod(categories) {
      const { last, get } = this.$lodash
      const untilDate = get(categories, '0.date')
      const sinceDate = get(last(categories), 'date')
      this.sinceDate = sinceDate
      this.untilDate = untilDate
    },

    setStatistics(categories) {
      const { mapValues } = this.$lodash
      this.statistics = categories.reduce((result, { transactions }) => {
        let categoryTransactions = []
        mapValues(transactions, ({ items }) => {
          categoryTransactions = [...categoryTransactions, ...items]
        })
        return [
          ...result,
          ...categoryTransactions,
        ]
      }, [])
    },

    showError(e) {
      console.error(e)
      this.errorMessage = 'Не удалось загрузить данные счёта'
      this.isError = true
    },

    openTransactionPopup(payload) {
      this.$store.commit('popups/setPopupPayload', {
        popupName: popupsNames.TRANSACTION,
        payload: {
          accountId: this.account.id,
          categories: this.categories,
          ...payload,
        }
      })
      this.$store.dispatch('popups/openPopup', popupsNames.TRANSACTION)
    },

    openTransactionTypePopup() {
      this.$store.dispatch('popups/openPopup', popupsNames.TRANSACTION_TYPE)
    },

    editTransaction(transaction) {
      return () => this.openTransactionPopup(transaction)
    },
  },

  mounted() {
    this.updateCategories()
  },

  subscriptions() {
    return {
      account$: this.$watchAsObservable('account').pipe(
        pluck('newValue'),
        map((account) => {
          this.updateCategories()
          return account
        })
      )
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/config/_colors.sass';

.transactions-period {
  font-size: 16px;
  font-family: "PT Sans";
  line-height: 22px;
  margin-bottom: 5px;
}

.accountHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: $white;

  $filledSize: (1em / 24 * 10);
  &__title {
    padding: $filledSize $filledSize 9px;
    margin: 0;
    background-color: $darkGray;
    color: inherit;
    z-index: 2;
  }
}

.account-transactions-header {
  display: flex;

  > * {
    width: 25%;
    margin: 0;
    padding: 0 .75em 1em;
    color: #979797;
    font-weight: bold;

    border: 1px solid $darkGray;
    border-top: 0;
    border-left: 0;

    &:last-child {
      border-right: 0;
    }
  }
}

.account-container {
  min-height: 360px;
}
</style>