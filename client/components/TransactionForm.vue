<template>
  <form v-if="isLoggedIn" @submit.prevent="onSubmit" class="transaction-form">
    <h1>Транзакция</h1>
    <base-dropdown
      v-if="$lodash.get(transactionsTypes, 'length')"
      labelText="Тип"
      :options="transactionsTypes"
      @selected="validateSelection"
      @filter="getDropdownValues"
      :defaultValue="defaultNameValue"
      name="transactionTypeId"
      placeholder="Выберете тип"
    />

    <div>
      <label for="date" id="dateLabel">
        Дата
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
    </div>

    <base-field
      v-model="payload.category"
      name="category"
      id="category"
      placeholder="Долг"
      labelText="Категория"
      :isRequired="false"
    />
    <base-field
      v-model="payload.segment"
      name="segment"
      id="segment"
      placeholder="05 Пит"
      labelText="Сегмент категории"
      :isRequired="false"
    />
    <base-field
      v-model="payload.transaction_object"
      name="transaction_object"
      id="transaction_object"
      placeholder="Иван Иванов/Сбербанк"
      labelText="Объект"
      :isRequired="false"
    />
    <base-field
      name="note"
      id="note"
      placeholder="Долг Ивана Иванованова"
      labelText="Заметка"
      v-model="payload.note"
      :isRequired="false"
    />

    <base-statistics
      :key="updateCount + 1"
      :isReadOnly="false"
      :consumption="payload.consumption"
      :profit="payload.profit"
      :balance="payload.balance"
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
/*TODO доработать созадние первой транзакции*/
export default {
  name: 'TransactionForm',
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
        transaction_object = '',
        segment = '',
        note = '',
        profit = 0.00,
        consumption = 0.00,
        type = {},
        accountId,
        date = this.$lodash.formatDate(Date.now(), 'YYYY-MM-DD'),
      } = this.transaction
      return {
        category,
        segment,
        note,
        profit,
        consumption,
        accountId,
        date,
        balance: this.getPreviousTransactionBalance(date, profit, consumption),
        transactionTypeId: this.$lodash.get(type, 'id', ''),
      }
    },

    defaultNameValue() {
      const { transactionTypeId } = this.payload
      return (this.transactionsTypes || []).find(({ id }) => id === transactionTypeId) || {}
    }
  },
  data() {
    return {
      isError: false,
      errorMessage: '',
      updateCount: 0,
      date: new Date(),
    }
  },

  created() {
    this.date = this.payload.date
  },

  methods: {
    onChangeDate() {
      this.payload.date = this.date
      this.setPreviousTransactionBalance()
    },

    validateSelection(selection) {
      this.payload.transactionTypeId = selection.id
    },

    setPreviousTransactionBalance() {
      const { date, profit, consumption } = this.payload
      this.payload.balance = this.getPreviousTransactionBalance(date, profit, consumption)
      this.updateCount += 1
    },

    getPreviousTransactionBalance(date, profit = 0.00, consumption = 0.00) {
      const { categories, id } = this.transaction
      const { get, formatDate, last } = this.$lodash
      console.log('date', date)
      const choosenDate = formatDate(date, 'x')
      const nearestMonth = Object.assign([], categories)
        .filter((t) => formatDate(t.date, 'x') <= choosenDate)
        .sort((a, b) => (
          (choosenDate - formatDate(a.date, 'x')) - (choosenDate - formatDate(b.date, 'x'))
        ))[0]

      const { transactions = [] } = nearestMonth || {}
      const currenTransactionIndex = transactions.findIndex((transaction) => transaction.id === id)
      let previousTransaction
      if (currenTransactionIndex !== -1) previousTransaction = transactions[currenTransactionIndex + 1]

      return (previousTransaction ? previousTransaction.balance : get(nearestMonth || last(categories), `transactions.0.balance`, 0.00)) + Math.abs(profit) - Math.abs(consumption)
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
  },
}
</script>

<style lang="scss" scoped>
h1 {
  font-size: 32px;
}
</style>
