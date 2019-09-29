<template>
  <div v-if="isLoggedIn" class="container">
    <transaction-types />

    <section class="account-container">
      <div class="accountHeader">
        <h1 class="accountHeader__title">
          {{$lodash.get(account, 'name')}}
        
          <div v-if="shownTransactionsSinceDate && shownTransactionsUntilDate" class="transactions-period">
            От <strong>{{shownTransactionsSinceDate | formatDate('DD MMMM YYYY')}}</strong> 
            по <strong>{{shownTransactionsUntilDate | formatDate('DD MMMM YYYY')}}</strong>
          </div>
        </h1>

        <div v-if="isUserNotViewer" class="actions transactions-actions">
          <base-button :action="openTransactionPopup" class="action-button" unstyled>Создать транзакцию</base-button>
          <base-button :action="toggleTransactions" class="action-button" unstyled>
            {{isDeletedTransactionsShown ? 'Действующие' : 'Удалённые'}} транзакиции
          </base-button>
        </div>

        <base-statistics :isFadeOut="isDeletedTransactionsShown" hasLitter :key="updateCount" :transactions="this.statistics" :accountBalance="accountBalance" />
      </div>

      <account-filter :accountCategories="accountCategories" @change="updateCategories" />

      <ul v-if="categories.length" class="account-transactions-categories">
        <li v-for="({ date, name, transactions }, index) in categories" :key="index + updateCount" class="account-transactions-category litter">
          <h2>{{date | formatDate('DD MMMM YYYY')}}</h2>

          <div class="account-transactions-header">
              <span>Тип транзакции</span>
              <span class="head head_category">Категория</span>
              <span class="head head_branch" >Филиал</span>
              <span class="head head_note">Примичание</span>
              <span class="head head_statistics">Статистика</span>
          </div>
           
          <ul class="account-transactions-list">
            <li v-for="(transaction, index) in transactions" :key="index + updateCount" class="account-transaction-item">
              <base-button class="account-transaction" :action="editTransaction(transaction)" unstyled>
                <h3>{{transaction.type.name}}</h3>
                <span>{{transaction.category}}</span>
                <span>{{transaction.branch}}</span>
                <span>{{transaction.note}}</span>
                <span><base-statistics :transactions="[transaction]" /></span>
              </base-button>
            </li>
          </ul>
        </li>
      </ul>
      <loader v-else-if="$apollo.queries.account.loading" />

      <p v-if="!categories.length" class="litter">
        <span v-if="!untilDate && !sinceDate && !filterType.id">
          На счету нет транзакиций.
        </span>
        <span v-else-if="filterType.name && !untilDate && !sinceDate">
          Нет транзакций с типом «{{filterType.name}}».
        </span>
        <span v-else-if="!filterType.name && untilDate">
          Нет транзакций созданных до {{untilDate | formatDate('MM.YYYY')}}.
        </span>
        <span v-else-if="!filterType.name && sinceDate">
          Нет транзакций созданных по {{sinceDate | formatDate('MM.YYYY')}}.
        </span>
        <span v-else>
          Нет транзакций с типом «{{filterType.name}}» созданных от {{sinceDate | formatDate('MM.YYYY')}} по {{untilDate | formatDate('MM.YYYY')}}.
        </span>
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
import { mapState } from 'vuex'
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

      update({ account = {} }) {
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

      update({ transactionType = {} }) {
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
    shownTransactionsSinceDate: undefined,
    shownTransactionsUntilDate: undefined,
  }),

  computed: {
    ...mapState('auth', ['isUserViewer', 'isLoggedIn']),
    ...mapState('accountFilter', ['sinceDate', 'untilDate', 'filterType']),

    isUserNotViewer() {
      return !this.isUserViewer
    },

    transactionTypeId() {
      return this.$lodash.get(this, 'transactionType.id')
    },
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
      const { sinceDate, untilDate, filterType } = this
      const { id: filterTypeId } = filterType
      const hasRangePeriod = sinceDate && untilDate
      const isDateInRange = this.$lodash.isDateInRange(untilDate, sinceDate)
      const categories = Object.values(get(account, 'transactions', []).reduce((result, transaction) => {
        const { category, type, date } = transaction
        const typeId = type.id
        if ((filterTypeId && typeId !== filterTypeId) || !isDateInRange(date)) return result

        const transactionsMemorized = get(result, `${date}.transactions`, []) 
        return {
          ...result,
          [date]: {
            typeId,
            date,
            transactions: [
              ...transactionsMemorized,
              transaction,
            ],
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
        this.shownTransactionsSinceDate = undefined
        this.shownTransactionsUntilDate = undefined
        this.statistics = []
      }

      this.categories = categories
      this.updateCount += 1
    },

    setPeriod(categories) {
      const { last, get } = this.$lodash
      this.shownTransactionsSinceDate = get(last(categories), 'date')
      this.shownTransactionsUntilDate = get(categories, '0.date')
    },

    setStatistics(categories) {
      this.statistics = this.account.transactions
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
      return () => this.isUserNotViewer && this.openTransactionPopup(transaction)
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

  @media (--until-tablet) {
    flex-wrap: wrap;
  }

  $filledSize: (1em / 24 * 10);
  &__title {
    padding: $filledSize $filledSize 9px;
    margin: 0;
    background-color: $darkGray;
    color: inherit;
    z-index: 2;

    @media (--from-tablet) {
      width: 360px;
    }

    @media (--until-tablet) {
      width: 100%;
    }
  }
}

.account-transactions-header {
  display: flex;

  @media (--until-tablet) {
    flex-wrap: wrap;
  }

  > * {
    margin: 0;
    padding: 0 .75em 1em;
    color: #979797;
    font-weight: bold;
    border: 1px solid $darkGray;
    border-top: 0;
    border-left: 0;

    @media (--from-tablet) {
      width: 20%;
      padding: 0 .75em 1em;
    }

    @media (--until-tablet) {
      min-width: 50%;
      padding: .75em .75em .85em;
    }

    &:last-child {
      
      @media (--until-tablet) {
        width: 100%;
        padding: .75em .75em .85em;
      }
    }
  }
}

.head_note, .head_category {
  @media (--until-tablet) {
    border-right: 0;
  }
} 

.head_statistics {
  border-right: 0;
  text-align: center;
}

.account-container {
  min-height: 360px;
}

.transactions-actions {
  padding: .7em  0;
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: white;


  @media (--until-tablet) {
    width: 100%;
    padding: 1em;
    margin: 1em auto;
    order: 4;
    box-shadow: 0 0 10px rgba(#333, .5);
  }

  @media (--from-tablet) {
    width: 360px;
  }

  button {
    margin-bottom: .5em;
  }
}

.account-transactions-list {
  margin-bottom: 0;
}
</style>