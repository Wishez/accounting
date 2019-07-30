<template>
  <div v-if="$store.state.auth.isLoggedIn" class="container">
    <div class="actions">
      <base-button :action="openAccountPopup" class-name="action-button" unstyled>
        Создать счёт
      </base-button>

      <base-button :action="openTransactionTypePopup" class-name="action-button" unstyled>
        Создать тип транзакции
      </base-button>
    </div>

    <transaction-types />

    <h1 class="accountsTitle">Счета</h1>
    <transition name="fading">
      <ul v-if="$lodash.get(accounts, 'data', []).length" class="accounts">
        <li
          v-for="({ id, name, transactions, slug }, index) in $lodash.get(accounts, 'data', [])"
          :key="index"
          class="accountTile"
        >
          <n-link :to="`/account/${slug}/`" class="accountLink">
            <h2 class="accountTile__name">{{ name }}</h2>
          </n-link>

          <h3>Транзакции</h3> 
          <transition name="fading">
            <ul v-if="$lodash.unionBy(transactions, 'type.id').length" class="accountTransactions">
              <li v-for="({ type }, index) in $lodash.unionBy(transactions, 'type.id')" :key="index" class="accountTransactionLink">
                <n-link :to="`/account/${slug}?type=${type.slug}`" :style="`background-color:${type.color}`" class="transactionType">
                    {{type.name}}
                </n-link>
              </li>
            </ul>
            <p v-else>Нет транзакций</p>
          </transition>

          <h3 class="statisticsHeading">Статистика</h3>
          <base-statistics :transactions="transactions" />

          <base-button :action="editAccount({ id, name, slug })" class-name="editButton action-button" unstyled>
            Редактировать
          </base-button>
        </li>
      </ul>
      <loader v-else-if="this.$apollo.queries.accounts.loading" />
      <p v-else>Нет доступных счетов</p>
    </transition>

    <modal-container :isShown="$store.state.popups[accountPopupName]">
      <account-form />
    </modal-container>
  </div>
</template>

<script>
import { ModalContainer, AccountForm, TransactionTypes } from '~/components'
import { popupsNames } from '~/constants/popups'
import { getAccountsRequestGql } from '~/constants/gql'

const accountPopupName = popupsNames.ACCOUNT
const transactionTypePopupName = popupsNames.TRANSACTION_TYPE

export default {
  components: {
    ModalContainer,
    AccountForm,  
    TransactionTypes,
  },
  apollo: {
    accounts: getAccountsRequestGql,
  },
  data() {
    return {
      accountPopupName,
    }
  },
  updated() {
    this.$apollo.queries.accounts.refetch()
  },

  methods: {
    openAccountPopup() {
      this.$store.dispatch('popups/openPopup', accountPopupName)
    },

    openTransactionTypePopup() {
      this.$store.dispatch('popups/openPopup', transactionTypePopupName)
    },

    editAccount(account) {
      return () => {
        this.$store.commit('popups/setPopupPayload', {
          popupName: accountPopupName,
          payload: account,
        })
        this.openAccountPopup()
      }
    },
  },
}
</script>

<style lang="scss">
@import '~/assets/styles/config/_colors.sass';
.editButton {
  margin-top: 1em;
}

.accounts {
  list-style: none;
  display: flex;
  flex-flow: row wrap;
  margin: 0 -10px;
}

.accountTransactions {
  list-style: none;
}

.accountTile {
  flex-basis: calc(33.3% - 20px);
  flex-grow: 1;
  padding: 1em 1em 1.5em;
  border: 2px solid $darkGray;
  margin: 1em 10px;
  background-color: #fff;

  @media (--from-tablet) {
    max-width: 50%;
  }

  @media (--until-tablet) {
    flex-basis: 100%;
  }

}

.statisticsHeading {
  margin-top: 1em;
}

.accountsTitle {
  margin-bottom: 0;
}
</style>

