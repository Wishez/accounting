<template>
  <div class="passwordContainer">
    <label v-if="labelText" :for="id" :id="`${name}Label`">
      {{labelText}}
    </label>
    <div class="passwordInputContainer">
      <input
        v-bind="$attrs"
        v-model="password"
        :type="passwordFieldType"
        :id="id"
        class="passwordInput"
        :name="id"
        aria-describedby="passwordLabel"
        placeholder="secretWords"
        :required="isRequired"
        minlength="8"
        maxlength="32"
      />
      <fa-icon class="passwordIcon" @click="changePasswordFieldView" :icon="['fas', passwordFieldType === 'password' ? 'eye-slash' : 'eye']" />
    </div>

    <base-button v-if="isGeneratePasswordButtonShown" :action="generatePassword" isSmall unstyled>Сгенирировать пароль</base-button>
  </div>
</template>

<script>
import { pluck, map } from 'rxjs/operators';
const passwordTogglingMap = {
  password: 'text',
  text: 'password',
}

export default {
  name: "PasswordField",
  data: () => ({
    passwordFieldType: 'password',
    password: '',
  }),
  methods: {
    changePasswordFieldView() {
      this.passwordFieldType = passwordTogglingMap[this.passwordFieldType]
    },

    generatePassword() {
      const password = Math.random().toString(36).slice(-8)
      this.password = password
    }
  },
  props: {
    defaultValue: String,
    isGeneratePasswordButtonShown: Boolean,
    id: {
      type: String,
      default: 'password'
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    labelText: {
      type: String,
      default: 'Пароль',
    },
    name: String,
  },
  created() {
    const { defaultValue } = this
    if (defaultValue) {
      this.password = defaultValue
    }
  },
  subscriptions() {
    return {
      password$: this.$watchAsObservable('password').pipe(
        pluck('newValue'),
        map((value) => {
          this.$emit('passwordChanged', value)
          return value
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.passwordContainer {
  width: 100%;

  button {
    display: block;
    margin-top: -2em;
    margin-bottom: 2em;
    text-decoration: underline
  }
}

.passwordInputContainer {
  position: relative;
  width: 100%;
  margin-bottom: 2em;
}

.passwordInput {
  margin-bottom: 0;
}

.passwordIcon {
  position: absolute;
  bottom: .9em;
  right: .9em;
}
</style>