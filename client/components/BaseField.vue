<template>
  <div v-if="shouldDisplayInput" :class="{
    fieldContainer: true,
    fieldContainer_inline: isInline,
  }">
      <label v-if="labelText" :for="id || name" :id="`${name}Label`">
        {{labelText}}
      </label>

      <div class="inputContainer">
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
        <fa-icon v-if="icon" class="inputIcon" @click="onIconClick" :icon="icon" />
      </div>
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
      default: false,
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
    icon: Array,
    onIconClick: {
      type: Function,
      default: () => {},
    },
    isInline: Boolean,
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

<style lang="scss" scoped>
.fieldContainer {
  width: 100%;

  &_inline {
    
  }
}
.inputContainer {
  position: relative;
  width: 100%;
}

.inputIcon {
  position: absolute;
  top: .8em;
  right: .5em;
}

</style>