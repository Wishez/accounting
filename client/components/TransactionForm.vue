<template>
  <form v-if="isLoggedIn" @submit.prevent="onSubmit">
    <h1>Транзакция</h1>
    <base-dropdown
      labelText="Тип"
      :options="transactionsTypes"
      @selected="validateSelection"
      @filter="getDropdownValues"
      :defaultValue="defaultNameValue"
      name="transactionTypeId"
      placeholder="Выберете тип"
    />

    <label for="date" id="dateLabel">
      Дата проведения транзакции
    </label>
    <VueDatePicker
      v-model="date"
      id="date"
      name="date"
      format="DD.MM.YYYY"
      formatOutput="YYYY-MM-DD"
      color="#de1f24"
      buttonCancel="Отмена"
      placeholdr="24.07.2019"
      @onChange="onChangeDate"
      noHeader
      fullscreenMobile
    />

    <base-field
      v-model="payload.category"
      name="category"
      id="category"
      placeholder="АА"
      labelText="Категория"
    />
    <base-field
      v-model="payload.branch"
      name="branch"
      id="branch"
      placeholder="Иваново"
      labelText="Филиал"
      :isRequired="false"
    />
    <base-field
      name="note"
      id="note"
      placeholder="Выплата Ивану Иванову"
      labelText="Заметка"
      v-model="payload.note"
      :isRequired="false"
    />

    <base-statistics
      :key="updateCount + 1"
      :transactions="[transactionStatistics]"
      :isReadOnly="false"
      @balance-input="value => setMoneyToPayload('balance', value)"
      @profit-input="value => setMoneyToPayload('profit', value)"
      @consumption-input="value => setMoneyToPayload('consumption', value)"
    />

    <p v-if="isError" class="error">{{errorMessage}}</p>

    <div class="formButtonsContainer">
      <base-button type="submit" class="action-button">
        Сохранить
      </base-button>

      <base-button v-if="isEdit" :action="deleteTransaction" type="button" class="action-button" unstyled>
        {{isDeleted ? 'Восстановить' : 'Удалить'}}
      </base-button>
    </div>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import { createTransactionGql, updateTransactionGql, getTransactionsTypesGql, deleteTransactionGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'
import { pluck, map } from 'rxjs/operators';

export default {
  name: 'TransactionForm',
  apollo: {
    transactionsTypes: {
      query: getTransactionsTypesGql,

      update({ transactionsTypes = {} }) {
        return transactionsTypes.isSuccess ? transactionsTypes.data : []
      }
    },
  },
  computed: {
    ...mapState('auth', ['isLoggedIn']),

    transaction() {
      return this.$lodash.get(this.$store.state.popups.payload, popupsNames.TRANSACTION, {})
    },

    isDeleted() {
      return Boolean(this.transaction.isDeleted)
    },

    isEdit() {
      return Boolean(this.transaction.id)
    },

    payload() {
      const {
        category = '',
        branch = '',
        note = '',
        profit = 0.00,
        consumption = 0.00,
        balance = 0.00,
        type = {},
        accountId,
        order = 0,
        date = this.$lodash.formatDate(Date.now(), 'YYYY-MM-DD'),
      } = this.transaction
      return {
        category,
        branch,
        note,
        profit,
        consumption,
        balance,
        accountId,
        order,
        date,
        transactionTypeId: this.$lodash.get(type, 'id', ''),
      }
    },

    defaultNameValue() {
      const { transactionTypeId } = this.payload
      return this.transactionsTypes.find(({ id }) => id === transactionTypeId) || {}
    }
  },
  data() {
    return {
      isError: false,
      errorMessage: '',
      transactionStatistics: {},
      money: {
        decimal: '.',
        thousands: '.',
        prefix: '',
        suffix: ' ₽',
        precision: 2,
      },
      updateCount: 0,
      date: new Date(),
    }
  },

  created() {
    this.date = this.payload.date
    this.setLastTransactionBalance()
    this.transactionStatistics = this.$lodash.pick(this.payload, ['profit', 'consumption', 'balance'])
  },

  methods: {
    onChangeDate() {
      this.payload.date = this.date
      this.setLastTransactionBalance()
    },

    validateSelection(selection) {
      this.payload.transactionTypeId = selection.id
      this.setLastTransactionBalance()
    },

    setLastTransactionBalance() {
      const currentTransactionTypeId = this.payload.transactionTypeId
      if (!this.isEdit && currentTransactionTypeId) {
        const { get, last } = this.$lodash
        const transactions = get(this.transaction.categories.find(({ typeId }) => (typeId === currentTransactionTypeId)), 'transactions', [])

        let items
        if (transactions.length) {
          const transactionsDated = transactions[this.payload.date]
          if (transactionsDated) {
            items = get(transactionsDated, 'items', [])
          } else {
            const lastTransactionsDated = last(Object.values(transactions)) || {}
            items = get(lastTransactionsDated, 'items', [])
          }
        } else {
          const lastCategory = last(Object.values(this.transaction.categories || {}))
          const categoryTransactions = Object.values(get(lastCategory, 'transactions', {}))
          const lastTransactionsDated = last(categoryTransactions)
          items = get(lastTransactionsDated, 'items', [])
        }

        const balance = get(items, `${items.length - 1}.balance`, 0)
        this.payload.balance = balance
        this.transactionStatistics = {...this.$lodash.pick(this.payload, ['profit', 'consumption']), balance }
        this.updateCount += 1
      }
    },

    setMoneyToPayload(fieldName, value) {
      this.payload[fieldName] = value
    },

    getDropdownValues(keyword) {},

    onSubmit() {
      this.clearErorState()
      if (this.isEdit) this.updateTransaction()
      else this.createTransaction()
    },

    createTransaction() {
      this.makeMutationRequest(createTransactionGql, 'createTransaction')
    },

    closePopup() {
      this.$store.commit('popups/closePopups')
    },

    handleResponse({ data: responseData }, requestName) {
      const { isSuccess, data } = responseData[requestName] || {}
      return isSuccess ? data : this.showRequestError()
    },

    clearErorState() {
      this.errorMessage = ''
      this.isError = false
    },

    updateTransaction() {
      this.makeMutationRequest(updateTransactionGql, 'updateTransaction', { uuid: this.transaction.id }, true)
    },

    async makeMutationRequest(mutation, requestName, payload, isEdit) {
      try {
        const response = await this.$apollo.mutate({
          mutation,
          variables: {
            ...payload,
            payload: isEdit
              ? this.$lodash.omit(this.payload, ['accountId', 'categories'])
              : this.$lodash.omit(this.payload, ['categories']),
          }
        }).then(response => this.handleResponse(response, requestName))
          .catch(this.showRequestError)

        const { id, account = {}, type = {} } = response || {}
        if (id && account.id === this.payload.accountId && type.id === this.payload.transactionTypeId) {
          this.closePopup()
        }
      } catch (e) {
        this.showRequestError()
      }
    },

    async deleteTransaction() {
      const result = await this.$apollo.mutate({
        mutation: deleteTransactionGql,
        variables: {
          uuid: this.transaction.id,
        }
      })
        .then(({ data }) => data.deleteTransaction)
        .catch(() => this.handleError('Не удалось удалить транзакцию'))
      
      if (this.$lodash.get(result, 'isSuccess')) this.closePopup()
    },

    handleError(message) {
      this.isError = true
      this.errorMessage = message
    },
    
    showRequestError() {
      this.handleError(`Не удалось ${this.isEdit ? 'обновить' : 'создать'} транзакцию`)
    },
    
    setNumberToPayload(fieldName, value) {
      this.payload[fieldName] = sum
    },
    
    calcDiferranceBalance(value, fieldName) {
      if (Math.abs(value) === this.payload[fieldName]) return
      this.balance = String((this.defaultBalance + value).toFixed(2))
    },
  },
}
</script>

<style scoped>
h1 {
  font-size: 32px;
}
</style>
