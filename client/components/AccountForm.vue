<template>
  <form v-if="isLoggedIn" @submit.prevent="onSubmit">
    <h1>Счёт</h1>
    <slug-field
      nameLabelText="Имя счёта"
      namePlaceholderText="Ivan Bank"
      slugPlaceholderText="ivan-bank"
      :slugValue="this.account.slug"
      :nameValue="this.account.name"
      @slugInput="value => payload.slug = value"
      @nameInput="value => payload.name = value"
    />

    <ColorField
      :entity="account"
      @changeColor="value => payload.color = value"
    />

    <p v-if="isError" class="error">{{errorMessage}}</p>

    <base-button type="submit">
      Сохранить
    </base-button>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import { createAccountGql, updateAccountGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'
import ColorField from './ColorField'

export default {
  name: 'AccountForm',
  components: {
    ColorField,
  },
  computed: {
    account() {
      return this.$lodash.get(this.$store.state.popups.payload, popupsNames.ACCOUNT, {})
    },

    ...mapState('auth', ['isLoggedIn']),
  },
  data() {
    return {
      isError: false,
      errorMessage: '',
      payload: {
        name: '',
        slug: '',
        color: '',
      },
    }
  },

  mounted() {
    const { slug, name, color } = this.account 
    if (name) {
      this.payload.name = name
      this.payload.slug = slug
      this.payload.color = color
    }
  },

  methods: {

    onSubmit() {
      this.clearErorState()
      if (this.account.slug) this.updateAccount()
      else this.createAccount()
    },

    createAccount() {
      this.makeMutationRequest(createAccountGql, 'createAccount')
    },

    closePopup() {
      this.$store.commit('popups/closePopups')
    },

    handleAccountResponse({ data: responseData }, requestName) {
      const { isSuccess, data } = responseData[requestName] || {}
      return isSuccess ? data : this.showErrorAccountRequest()
    },

    clearErorState() {
      this.errorMessage = ''
      this.isError = false
    },

    updateAccount() {
      this.makeMutationRequest(updateAccountGql, 'updateAccount', { uuid: this.account.id })
    },

    async makeMutationRequest(mutation, requestName, payload) {
      try {
        const response = await this.$apollo.mutate({
          mutation,
          variables: {
            ...payload,
            payload: this.payload
          }
        }).then(response => this.handleAccountResponse(response, requestName))
          .catch(this.showErrorAccountRequest)

        if (response.id) this.closePopup()
      } catch (e) {
        console.error(e)
        this.showErrorAccountRequest()
      }
    },

    handleError(message) {
      this.isError = true
      this.errorMessage = message
    },
    
    showErrorAccountRequest() {
      this.handleError('Не удалось создать или обновить счёт')
    },
  },
}
</script>
