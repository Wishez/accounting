<template>
  <div v-if="auth.isLoggedIn" class="container">
    <transaction-types />

    <section class="accountsTiles">
      <h1 class="accountsTitle">Счета</h1>

      <loader v-if="isSearchLoading" />

      <div class="actions_near actions accounts-actions">
        <base-button v-if="isUserNotViewer" :action="toggleAccounts" class-name="action-button" unstyled>
            Посмотреть {{isDeletedShown ? 'действующие' : 'удалённые'}} счета
        </base-button>

        <base-button v-if="isUserNotViewer" :action="openAccountPopup" class-name="action-button" unstyled>
          Создать счёт
        </base-button>

        <base-field
          v-model="nameFilterValue"
          name="nameFilter"
          id="nameFilter"
          autocomplete="off"
          placeholder="FF/11"
          :icon="['fas', 'search']"
        />
      </div>
    
      <ul v-if="$lodash.get(accounts, 'length', 0)" class="accounts">
        <li
          v-for="({ id, name, transactions, slug, color }, index) in accounts.filter(({ name }) => name.indexOf(searchName) !== -1)"
          :key="index"
          :style="`border-color:${color};`"
          class="accountTile"
        >
          <h2 class="accountTile__name">
            <n-link :to="`/account/${slug}/`" class="accountLink">{{ name }}</n-link>
          </h2>

          <h3>Транзакции</h3> 
          <ul v-if="$lodash.unionBy(transactions, 'type.id').length" class="actions">
            <li v-for="({ type }, index) in $lodash.unionBy(transactions, 'type.id')" :key="index" class="action-button">
              <n-link :to="`/account/${slug}?type=${type.slug}`" class="transactionType">
                  {{type.name}}
              </n-link>
            </li>
          </ul>
          <p v-else>Нет транзакций</p>

          <h3 class="statisticsHeading">Статистика</h3>
          <base-statistics :transactions="transactions" />

          <div v-if="isUserNotViewer" class="formButtonsContainer formButtonsContainer_topOffset">
            <base-button :action="editAccount({ id, name, slug })" class-name="action-button" unstyled>
              Редактировать
            </base-button>
            <base-button :action="deleteAccount(id)" class-name="action-button" unstyled>
              {{accountDeleteButtonText}}
            </base-button>
          </div>
        </li>
      </ul>
      <loader v-else-if="this.$apollo.queries.accounts.loading" />
      <p v-else class="empty-items">Нет {{isDeletedShown ? 'удалённых' : 'доступных'}} счетов</p>
    </section>

    <modal-container :isShown="$store.state.popups[accountPopupName]" :onClose="refetchUpdatedAccounts">
      <account-form />
    </modal-container>
  </div>
</template>

<script>
import { ModalContainer, AccountForm, TransactionTypes } from '~/components'
import { popupsNames } from '~/constants/popups'
import { getAccountsRequestGql, deleteAccountGql } from '~/constants/gql'
import { pluck, debounceTime, map, of } from 'rxjs/operators'

const accountPopupName = popupsNames.ACCOUNT
const transactionTypePopupName = popupsNames.TRANSACTION_TYPE

export default {
  name: 'AccountsPage',

  components: {
    ModalContainer,
    AccountForm,  
    TransactionTypes,
  },
  
  apollo: {
    accounts: {
      query: getAccountsRequestGql,

      update({ accounts }) {
        return accounts.isSuccess ? accounts.data : []
      }
    }
  },

  computed: {
    auth() {
      return this.$store.state.auth
    },

    isUserNotViewer() {
      return !this.auth.isUserViewer
    }
  },

  data() {
    return {
      accountPopupName,
      isDeletedShown: false,
      accountDeleteButtonText: 'Удалить',
      searchName: '',
      nameFilterValue: '',
      isSearchLoading: false,
    }
  },

  methods: {
    refetchAccounts() {
      this.$apollo.queries.accounts.refetch({
        isDeletedShown: this.isDeletedShown,
      })
    },

    refetchUpdatedAccounts() {
      this.isDeletedShown = false
      this.refetchAccounts()
    },

    toggleAccounts() {
      const isDeletedShown = !this.isDeletedShown
      this.isDeletedShown = isDeletedShown
      this.accountDeleteButtonText = isDeletedShown ? 'Восстановить' : 'Удалить'
      this.refetchAccounts()
    },

    openAccountPopup() {
      this.$store.dispatch('popups/openPopup', accountPopupName)
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

    deleteAccount(uuid) {
      return async () => {
        const result = await this.$apollo.mutate({
          mutation: deleteAccountGql,
          variables: {
            uuid,
          }
        }).then(({ data }) => data.deleteAccount)
  
        if (result.isSuccess) this.refetchAccounts()
      }
    },
  },

  subscriptions() {
    return {
      $searchName: this.$watchAsObservable('nameFilterValue').pipe(
        map((value) => {
          this.isSearchLoading = true
          return value
        }),
        debounceTime(500),
        pluck('newValue'),
        map(value => {
          this.searchName = value
          this.isSearchLoading = false
        })
      ),
    }
  }
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
  box-shadow: 0 0 10px rgba(#333, .5);
  border: 3px dashed;
  margin: 0 10px 1em;
  background-color: #fff;

  @media (--until-tablet) {
    flex-basis: 100%;
  }

}

.statisticsHeading {
  margin-top: 1em;
}
.accountsTiles {
  min-height: 438px;
}

.accounts-actions {
  display: flex;
  align-items: flex-end;
}
</style>

