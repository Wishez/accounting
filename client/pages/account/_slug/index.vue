<template>
  <div v-if="isLoggedIn" class="container">
    <transaction-types />

    <section class="account-container">
      <div class="accountHeader">
        <h1 class="accountHeader__title litter">
          {{$lodash.get(account, 'name')}}
        
          <div v-if="shownTransactionsSinceDate && shownTransactionsUntilDate" class="transactions-period">
            От <strong>{{shownTransactionsSinceDate | formatDate('DD MMMM YYYY')}}</strong> 
            по <strong>{{shownTransactionsUntilDate | formatDate('DD MMMM YYYY')}}</strong>
          </div>
        </h1>

        <div v-if="isUserNotViewer" class="actions_near transactions-actions litter">
          <base-button :action="openTransactionPopup" class="action-button" unstyled>Создать транзакцию</base-button>
          <base-button :action="toggleTransactions" class="action-button" unstyled>
            {{isDeletedTransactionsShown ? 'Действующие' : 'Удалённые'}} транзакиции
          </base-button>
        </div>

        <base-statistics
          className="litter"
          :isFadeOut="isDeletedTransactionsShown"
          :consumption="$lodash.get(account, 'totalConsumption')"
          :profit="$lodash.get(account, 'totalProfit')"
          :balance="$lodash.get(account, 'totalBalance')"
          :key="updateCount"
          hasLitter
          isBalance
        />
      </div>

      <div class="filter-holder">
        <account-filter :accountTransactionsTypes="$lodash.get(account, 'transactionsTypes', [])" @change="updateCategories" />
        <loader v-if="isUpdating || $apollo.queries.account.loading" />
      </div>

      <ul v-if="categories.length" class="account-transactions-categories">
        <li v-for="({ date, name, transactions }, index) in categories.slice(0, pageNumber)" :key="index + updateCount" class="account-transactions-category litter">
          <h2>{{date | formatDate('DD MMMM YYYY')}}</h2>

          <div class="account-transactions-header base-table-grid">
              <span class="account-transaction-head">Тип транзакции</span>
              <span class="account-transaction-head">Категория</span>
              <span class="account-transaction-head" >Сегмент категории</span>
              <span class="account-transaction-head" >Объект</span>
              <span class="account-transaction-head">Примичание</span>
              <span class="account-transaction-head">Приход</span>
              <span class="account-transaction-head">Расход</span>
              <span class="account-transaction-head">Сальдно</span>
          </div>
           
          <ul class="account-transactions-list">
            <li v-for="(transaction, index) in transactions" :key="index + updateCount" class="account-transaction-item">
              <a class="account-transaction base-table-grid" @click="editTransaction(transaction)" >
                <h3 class="row_transaction-type">{{transaction.type.name}}</h3>
                <span>{{transaction.category}}</span>
                <span>{{transaction.segment}}</span>
                <span>{{transaction.transaction_object}}</span>
                <span class="field field_note">{{transaction.note}}</span>
                <span class="field_no-wrap">{{transaction.profit | formatMoney}}</span>
                <span class="field_no-wrap">{{transaction.consumption | formatMoney}}</span>
                <span class="field_no-wrap">{{transaction.balance | formatMoney}}</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>

      <p v-if="!categories.length && !(isUpdating || $apollo.queries.account.loading)" class="litter">
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

      <p v-if="$apollo.queries.account.error" class="error">
        {{errorMessage}}
      </p>

      <div ref="pagination" class="pagination litter"></div>
    </section>

  <modal-container :onClose="refetchTransactions" :isShown="$store.state.popups[transactionPopupName]" modifier="full-width" className="transaction-form-popup">
      <transaction-form />
    </modal-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { popupsNames } from '~/constants/popups'
import { getAccountGql } from '~/constants/gql'
import { setPagination } from '~/constants/pagination'
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
      },

      fetchPolicy: 'network-only',
      prefetch: false,
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
    isUpdating: false,
    categories: [],
    accountCategories: [],
    isDeletedTransactionsShown: false,
    shownTransactionsSinceDate: undefined,
    shownTransactionsUntilDate: undefined,
    pageNumber: 2,
  }),

  computed: {
    ...mapState('auth', ['isUserViewer', 'isLoggedIn']),
    ...mapState('accountFilter', ['sinceDate', 'untilDate', 'filterType']),

    isUserNotViewer() {
      return !this.isUserViewer
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
      this.isUpdating = true
      this.pageNumber = 2

      setTimeout(() => {
        const { get } = this.$lodash
        const { account = {} } = this
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
          this.setPeriod(categories)
        } else {
          this.shownTransactionsSinceDate = undefined
          this.shownTransactionsUntilDate = undefined
        }

        this.categories = categories
        this.isUpdating = false
        this.updateCount += 1
      }, 1000)
    },

    setPeriod(categories) {
      const { last, get } = this.$lodash
      this.shownTransactionsSinceDate = get(last(categories), 'date')
      this.shownTransactionsUntilDate = get(categories, '0.date')
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

    editTransaction(transaction) {
      this.isUserNotViewer && this.openTransactionPopup(transaction)
    },
  },

  mounted() {
    this.updateCategories()
    setPagination.call(this)
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
    min-height: 66px;
    margin-bottom: .4em;
    background-color: $darkGray;
    color: inherit;
    z-index: 2;

    @media (--from-tablet) {
      width: calc(33.33% - 13px);
      margin-right: 13px;
    }

    @media (--until-tablet) {
      width: 100%;
    }
  }
}

.account-transaction-head {
  color: #979797;
  font-weight: bold;
  align-items: flex-end;
}

.account-transactions-header {

  > * {

    @media (--from-tablet) {
      padding: 0 .75em 1em;
    }

    @media (--until-tablet) {
      padding: .75em .75em .85em;
    }
  }
}

.account-container {
  min-height: 360px;
}

.transactions-actions {
  padding: .7em  0;
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
    width: 33.33%;
  }

  button {
    margin-bottom: .5em;
  }
}

.account-transactions-list {
  margin-bottom: 0;
}

.filter-holder {
  position: relative;
  
  .logo_loader {
    z-index: 1000;
  }
}

.field {

  &_note {
    font-size: 13px;
    font-weight: bold;
    text-align: left;
  }

  &_no-wrap {
    white-space: nowrap;
  }
}

.row_transaction-type {
  font-size: 16px;
}
</style>