<template>
  <button
    :class="{
      'unstyledButton': unstyled,
      'button': !unstyled,
      'button_small': isSmall,
      [`button_${modifier}`] : modifier && !unstyled,
      [className]: className,
    }"
    :aria-pressed="pressed"
    :type="type || 'button'"
    :aria-label="label"
    :disabled="disabled"
    tabindex="0"
    role="button"
    @click="onClick"
    @blur="makeActionByBlur"
  >
    <slot/>
  </button>
</template>

<script	>
export default {
  name: "BaseButton",
  props: {
    isDefaultPressed: {
      type: Boolean,
      required: false,
      default: false
    },
    modifier: {
      type: String,
      required: false,
      default: "red"
    },
    unstyled: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    className: {
      type: String,
      required: false,
      default: null
    },
    action: {
      type: [Function, Boolean],
      required: false,
      default: false
    },
    type: {
      type: String,
      required: false,
      default: ""
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    onBlur: {
      type: [Function, Boolean],
      required: false,
      default: false
    },
    isSmall: Boolean,
  },
  data: () => ({
    pressed: false
  }),
  mounted() {
    this.$set(this, "pressed", this.isDefaultPressed);
  },
  methods: {
    onClick: function(event) {
      this.$set(this, "pressed", !this.pressed);
      if (this.action) {
        this.action(event);
      }
    },
    makeActionByBlur: function(event) {
      this.$set(this, "pressed", false);

      if (this.onBlur) {
        this.onBlur(event);
      }
    }
  }
};
</script>
<style lang="sass" scoped>
  @import '~/assets/styles/config/_easing.sass'

  @import '~/assets/styles/config/_colors.sass'

  .unstyledButton
    border-width: 0
    background: none

  button
    cursor: pointer
    font-size: 1em
    font-family: 'PT Sans'
    &:disabled
      opacity: .5
      cursor: default
      &:hover, &:active, &:focus
        transform: none

  .button
    display: flex
    justify-content: center
    align-items: center
    padding: .8em 1.5em
    position: relative
    border-radius: 40px
    user-select: none
    z-index: 1
    transition: all 0.3s $standart
    will-change: transform
    transform-style: preserve-3d
    border: 0

    &_small
      font-size: 0.83em

    &_red
      background-color: $red
      color: $white

    &_white
      background-color: $white
      color: $darkGray


    &:hover, &:focus
      transform: scale(1.02)

    &:active
      transform: scale(1.02) translateY(2px)

    &_centered
      margin-left: auto
      margin-right: auto
</style>
