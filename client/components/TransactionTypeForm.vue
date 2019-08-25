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

    <label id="colorLabel">
      Цвет
    </label>
    <color-picker v-bind="color" class="form-color-picker" @input="selectColor"></color-picker>

    <div class="radio-button-container">
      <input v-model="color" class="radio-button" name="color" type="radio" :value="chooseColor" id="luminosityColor" aria-describedby="luminosityColorLabel" @change="changeColor" />
      <label for="luminosityColor">
        Выбрать
      </label>
    </div>
  
    <div class="radio-button-container">
      <input v-model="color" name="color" class="radio-button" type="radio" :value="{
        hue: 255,
        saturation: 0,
        luminosity: 0,
        alpha: 1
      }" id="luminosityBlack" aria-describedby="luminosityBlackLabel" @change="changeColor" />
      <label for="luminosityBlack">
        Чёрный
      </label>
    </div>


    <div class="radio-button-container">
      <input v-model="color" class="radio-button" name="color" type="radio" :value="{
        hue: 255,
        saturation: 100,
        luminosity: 100,
        alpha: 1
      }" id="luminosityWhite" aria-describedby="luminosityWhiteLabel" @change="changeColor" />
      <label for="luminosityWhite" id="luminosityWhiteLabel">
        Белый
      </label>
    </div>

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
import ColorPicker from '@radial-color-picker/vue-color-picker'
import { createTransactionTypeGql, updateTransactionTypeGql, getTransactionTypeGql, deleteTransactionTypeGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'

export default {
  name: 'AccountForm',

  components: {
    ColorPicker
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

    baseColor() {
      const { color } = this.transactionType
      const parsedColor = this.$lodash.getHslFromHex(color)
      let { hue = 50, luminosity = 50 } = parsedColor
      return {
        hue,
        saturation: 100,
        luminosity,
        alpha: 1
      }
    }
  },

  mounted() {
    this.setColor()
  },

  data() {
    return {
      isError: false,
      errorMessage: '',
      color: {
        hue: 50,
        saturation: 100,
        luminosity: 50,
        alpha: 1
      },
      chooseColor: {
        hue: 50,
        saturation: 100,
        luminosity: 50,
        alpha: 1,
      },
    }
  },
  methods: {
    onSubmit() {
      this.clearErorState()
      if (this.isEdit) this.updateTransactionType()
      else this.createTransactionType()
    },
  
    setColor() {
      this.color = { ...this.baseColor }
    },

    selectColor(colorHue) {
      this.color.hue = colorHue
      this.chooseColor.hue = colorHue
      let color = '#ffffff'
      const { hue, saturation, luminosity } = this.color
      if (luminosity === 50) {
        color = this.$lodash.getHexFromHsl(hue, saturation, luminosity)
      } else if (luminosity === 0) {
        color = '#333333'
      }
      this.payload.color = color
    },

    changeColor() {
      this.selectColor(this.color.hue)
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
