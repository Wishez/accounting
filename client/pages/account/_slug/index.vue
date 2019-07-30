<template>
  <div class="container">
    <div class="actions">
      <base-button :action="openTransactionPopup" class="action-button" unstyled>Создать транзакцию</base-button>
      <base-button :action="openTransactionTypePopup" class="action-button" unstyled>Создать тип транзакции</base-button>
    </div>

    <transaction-types />

    <account-filter @change="updateCategories" />

    <section>
      <div class="accountHeader">
        <h1 class="accountHeader__title">{{$lodash.get(account, 'name')}}</h1>

        <base-statistics hasLitter :key="updateCount" :transactions="this.statistics" :accountBalance="accountBalance" />
      </div>

      <transition name="fading">
        <ul v-if="categories.length" class="account-transactions-categories">
          <li v-for="({ typeName, name, items, transactions }, index) in categories" :key="index + updateCount" class="account-transactions-category litter">
            <h2>{{typeName}}</h2>
            

            <div v-for="(subTransactions, index) in Object.values(transactions)" :key="index + updateCount">
              <h3>{{subTransactions.date | formatDate('DD MMMM YYYY')}}</h3>

              <div class="account-transactions-header">
                <span class="head head_category">Категория</span>
                <span class="head head_branch" >Филиал</span>
                <span class="head head_note">Примичание</span>
                <span class="head head_statistics">Статистика</span>
              </div>
              <ul class="account-transactions-list">
                <li v-for="(transaction, index) in subTransactions.items" :key="index + updateCount" class="account-transaction-item">
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
      </transition>

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

    <modal-container :onClose="() => $apollo.queries.account.refetch()" :isShown="$store.state.popups[transactionPopupName]">
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
  apollo: {
    account: {
      query: getAccountGql,

      variables() {
        return {
          slug: this.$route.params.slug,
        }
      },

      update(response) {
        return response.account.data
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
        return this.$lodash.get(transactionType, 'isSuccess') ? transactionType.data : {}
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
    updateCategories() {
      const { get } = this.$lodash
      const { transactionTypeId } = this
      const { date: filterDate, type: filterType } = this.filter
      const { id: filterTypeId } = filterType
      
      const categories = Object.values(get(this.account, 'transactions', []).reduce((result, transaction) => {
        const { category, type, date } = transaction
        const typeId = type.id
        if ((transactionTypeId && typeId !== transactionTypeId) ||
          (filterTypeId && typeId !== filterTypeId) ||
          (filterDate && date.indexOf(filterDate) === -1)) return result

        const transactionsMemorized =get(result, `${typeId}.transactions`, {}) 
        const itemsDated = get(transactionsMemorized, `${date}.items`, [])
        const transactions = {
          ...transactionsMemorized,
          [date]: {
            date: date,
            items: [
              ...itemsDated,
              transaction,
            ].sort((a, b) => a.order - b.order),
          }
        }
        return {
          ...result,
          [typeId]: {
            typeName: type.name,
            typeId,
            transactions,
          }
        }
      }, {}))

      if (categories.length) {
        const { last, mapValues } = this.$lodash
        const lastTransaction = last(this.account.transactions)
        this.accountBalance = Number(get(lastTransaction, 'balance', 0)).toFixed(2)

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
      }

      this.updateCount += 1
      this.categories = [...categories]
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

    changeType() {

    },

    changeDate() {

    }
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

.accountHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: $white;

  $filledSize: (1em / 24 * 10);
  &__title {
    padding: $filledSize $filledSize 9px;
    margin: 0 #{-$filledSize};
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
</style>