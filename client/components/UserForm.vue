<template>
  <form v-if="isLoggedIn" @submit.prevent="onSubmit">
    <h1 v-if="!isEdit">Пользователь</h1>
    <base-field
      v-model="firstName"
      name="firstName"
      autocomplete="additional-name"
      id="firstName"
      labelText="Имя"
      placeholder="Иван"
      isRequired
    />
    <base-field
      v-model="secondName"
      name="secondName"
      id="secondName"
      autocomplete="given-name"
      labelText="Фамилия"
      placeholder="Иванов"
      isRequired
    />

    <base-field
      v-model="middleName"
      name="middleName"
      autocomplete="family-name"
      id="middleName"
      labelText="Отчество"
      placeholder="Иванович"
    />

    <base-dropdown
      v-if="!isEdit"
      labelText="Роль"
      :options="roles"
      :defaultValue="roles[2]"
      @selected="validateSelection"
      placeholder="Выберете роль"
    />

    <base-field
      v-model="payload.email"
      name="email"
      type="email"
      id="email"
      labelText="Email"
      placeholder="shiningfinger@list.ru"
      autocomplete="off"
      isRequired
    />

    <password-field
      id="newPassword"
      name="newPassword"
      labelText="Новый пароль"
      autocomplete="off"
      @passwordChanged="value => payload.password = value"
      isGeneratePasswordButtonShown
      :isRequired="!isEdit"
    />

    <p v-if="isError" class="error">{{errorMessage}}</p>

    <div v-if="isEdit" class="accept-changes-container">
      <h2>Подтверждение</h2>
      <password-field
        v-if="isEdit"
        labelText="Текущий пароль"
        id="currentPassword"
        name="currentPassword"
        isRequired
        @passwordChanged="value => currentPassword = value"
      />
      <p class="note user-note">Для подверждения изменений</p>
    </div>

    <p v-if="isAuthError" class="error">{{authErrorMessage}}</p>
    <p v-if="isSuccess" class="success">{{successMessage}}</p>
    <base-button type="submit">
      {{isEdit ? 'Обновить' : 'Сохранить'}}
    </base-button>
  </form>
</template>

<script>
import { createProfileGql, updateProfileGql, authenticateUserGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'
import { roles, fetechUserProfile } from '~/constants/user'
import { pluck, map } from 'rxjs/operators'

export default {
  name: 'UserForm',
  computed: {
    isLoggedIn() {
      return this.$store.state.auth.isLoggedIn
    },

    user() {
      return this.$store.state.auth.user
    },

    payload() {
      if (this.isEdit) {
        return {
          ...this.$lodash.pick(this.user, ['email']),
        }
      }
      return {
        role: '',
        name: '',
        email: '',
        password: '',
      }
    }
  },

  props: {
    isEdit: Boolean,
  },

  data() {
    return {
      isError: false,
      errorMessage: '',
      firstName: '',
      secondName: '',
      middleName: '',
      fullName: [],
      currentPassword: '',
      roles,
      authErrorMessage: 'Неправильно введён пароль',
      successMessage: 'Профиль успешно обновлён',
      isSuccess: false,
      isAuthError: false,
    }
  },

  mounted() {
    if (this.isEdit) this.setUserFields()
  },

  methods: {
    validateSelection(selection) {
      this.payload.role = selection.id
    },

    setUserFields() {
      const { firstName = '', lastName = '', email = '' } = this.user
      const [name = '', middleName = ''] = firstName.split(' ')
      this.firstName = name
      this.secondName = lastName
      this.middleName = middleName
    },

    onSubmit() {
      this.isAuthError = false
      this.isSuccess = false
      if (this.isEdit) this.checkUserCredentionals()
      else this.createUser()
    },

    makeAuthRequest(email, password) {
      return this.$apollo.mutate({
        mutation: authenticateUserGql,
        variables: {
          email,
          password,
        },
      }).then(({ data: responseData }) => (responseData.login || {}))
        .catch(this.showAuthError)
    },

    async checkUserCredentionals() {
      try {
        const response = await this.makeAuthRequest(this.user.email, this.currentPassword)

        if (response.email) this.updateUser()
        else this.showAuthError()
      } catch (e) {
        this.showAuthError()
      }
    },

    showAuthError() {
      this.isAuthError = true
    },

    async updateUser() {
      try {
        const response = await this.$apollo.mutate({
          mutation: updateProfileGql,
          variables: {
            uuid: this.user.id,
            payload: this.$lodash.omit(this.payload, [this.payload.password ? '' : 'password']),
          }
        }).then(response => this.handleResponse(response, 'updateProfile'))
          .catch(this.showRequestError)

      if (response.id) {
        this.showSuccess()
        const oldEmail = this.user.email
        this.$store.commit('auth/setCurrentProfile', response)
        const { password } = this.payload
        const { email } = response
        if (password || oldEmail !== email) {
          const updateTokenResponse = await this.makeAuthRequest(email, password || this.currentPassword)
          await this.$apolloHelpers.onLogin(updateTokenResponse.access)
        }
      }
      } catch (e) {
        this.showRequestError()
      }
    },

    showSuccess() {
      this.isSuccess = true
    },

    async createUser() {
      try {
        const response = await this.$apollo.mutate({
          mutation: createProfileGql,
          variables: {
            payload: this.payload,
          }
        }).then(response => this.handleResponse(response, 'createProfile'))
          .catch(this.showRequestError)

        const { id } = response || {}
        if (id) this.closePopup()
      } catch (e) {
        this.showRequestError()
      }
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

    handleError(message) {
      this.isError = true
      this.errorMessage = message
    },
    
    showRequestError() {
      this.handleError(`Не удалось ${this.isEdit ? 'обновить' : 'создать'} профиль`)
    },

    getFormattedNamePart(value, index) {
      const name = this.$lodash.upperFirst(value.trim().split(' ')[0])
      this.fullName[index] = name
      this.payload.name = this.fullName.join(' ')
      return name
    }
  },

  watch: {
    user(value) {
      this.setUserFields()
    },

    firstName(value) {
      return this.getFormattedNamePart(value, 0)
    },
    secondName(value) {
      return this.getFormattedNamePart(value, 2)
    },
    middleName(value) {
      return this.getFormattedNamePart(value, 1)
    }
  },
}
</script>

<style scoped>
.user-note {
    margin-top: -2em;
    margin-bottom: 2em;
}
.accept-changes-container {
  width: 100%;
}
</style>
