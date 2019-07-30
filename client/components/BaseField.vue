<template>
  <div v-if="shouldDisplayInput">
      <label v-if="labelText" :for="id || name" :id="`${name}Label`">
        {{labelText}}
      </label>
      <input
        v-bind="$attrs"
        :value="value"
        :placeholder="placeholder"
        :type="type"
        :name="name"
        :id="id || name"
        :aria-describedby="`${name}Label`"
        :required="isRequired"
        v-on="listeners"
      />
    </div>
</template>

<script>
export default {
  name: "BaseField",
  props: {
    shouldDisplayInput: {
      type: Boolean,
      default: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'text',
    },
    name: String,
    id: String,
    value: String,
    placeholder: String,
    labelText: String,
  },
  computed: {
    listeners() {
      return Object.assign({}, this.$listeners, {
        input: event => this.$emit('input', event.target.value),
      })
    }
  },
}
</script>

<style lang="sass" scoped>
</style>