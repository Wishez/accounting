<template>
  <form v-if="isLoggedIn" @submit.prevent="onSubmit">
    <h1>Тип </h1>
    <slug-field
      nameLabelText="Имя типа транзакции"
      namePlaceholderText="Издержка"
      slugPlaceholderText="izderzhka"
      :slugValue="this.transactionType.slug"
      :nameValue="this.transactionType.name"
      @slugInput="value => {
        slug = value
        payload.slug = value
      }"
      @nameInput="value => {
        name = value
        payload.name = value
      }"
    />

    <ColorField
      :entity="transactionType"
      @changeColor="value => payload.color = value"
    />

    <p v-if="isError" class="error">{{errorMessage}}</p>

    <div class="formButtonsContainer formButtonsContainer_topOffset">
      <base-button type="submit" class="action-button">
        Сохранить
      </base-button>

      <base-button v-if="isEdit" :action="deleteTransactionType" type="button" class="action-button" unstyled>
        {{isDeleted ? 'Восстановить' : 'Удалить'}}
      </base-button>
    </div>
  </form>
</template>

<script>
import { createTransactionTypeGql, updateTransactionTypeGql, getTransactionTypeGql, deleteTransactionTypeGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'
import ColorField from './ColorField'
export default {
  name: 'TransactionTypeForm',

  components: {
    ColorField,
  },

  computed: {
    transactionType() {
      return this.$lodash.get(this.$store.state.popups.payload, popupsNames.TRANSACTION_TYPE, {})
    },

    isEdit() {
      return Boolean(this.transactionType.id)
    },

    isDeleted() {
      return Boolean(this.transactionType.isDeleted)
    },

    isLoggedIn() {
      return this.$store.state.auth.isLoggedIn
    },
    
    payload() {
      const { slug = '', name = '', color = '' } = this.transactionType
      return {
        slug,
        name,
        color
      }
    },
  },

  data() {
    return {
      isError: false,
      errorMessage: '',
    }
  },
  methods: {
    onSubmit() {
      this.clearErorState()
      if (this.isEdit) this.updateTransactionType()
      else this.createTransactionType()
    },

    createTransactionType() {
      this.makeMutation(createTransactionTypeGql, 'createTransactionType')
    },

    handleTransactionTypeResponse({ data: responseData }, requestName) {
      const { isSuccess, data } = responseData[requestName]
      return isSuccess ? data : this.showErrorTransactionTypeRequest()
    },

    clearErorState() {
      this.errorMessage = ''
      this.isError = false
    },

    updateTransactionType() {
      this.makeMutation(updateTransactionTypeGql, 'updateTransactionType', { uuid: this.transactionType.id })
    },

    async makeMutation(mutation, requestName, variables) {
      try {
        const response = await this.$apollo.mutate({
          mutation,
          variables: {
            ...variables,
            payload: this.payload
          }
        }).then(response => this.handleTransactionTypeResponse(response, requestName))
          .catch(this.showErrorTransactionTypeRequest)

        if (response.id) this.closePopup()
      } catch (e) {
        console.error(e)
      }
    },

    closePopup() {
      this.$store.commit('popups/closePopups')
    },

    async deleteTransactionType() {
      const result = await this.$apollo.mutate({
        mutation: deleteTransactionTypeGql,
        variables: {
          uuid: this.transactionType.id,
        }
      })
        .then(({ data }) => data.deleteTransactionType)
        .catch(() => this.handleError('Не удалось удалить транзакцию'))
      
      if (result.isSuccess) this.closePopup()
    },

    handleError(message) {
      this.isError = true
      this.errorMessage = message
    },
    
    showErrorTransactionTypeRequest() {
      this.handleError('Не удалось создать тип транзакции')
    }
  },

  beforeMount() {
    if (this.accountId) {
      this.getTransactionType()
    }
  },
  
}
</script>
