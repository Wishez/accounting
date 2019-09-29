<template>
  <transition
    name="fading"
    appear>
    <div
      v-if="isShown"
      :class="`popup ${containerClass ? ' '+containerClass : ''}`"
      role="presentation"
      @click.self="closeModal"
    >
      <!-- begin litter -->
      <section
        :class="{
          'popupLitter': true,
          [className]: className,
          [`popupLitter_${modifier}`]: modifier,
        }"
      >
        <slot />
        <base-button
          :action="closeModal"
          class-name="popupLitter__closeButton"
          unstyled
        >
          <fa-icon color="#de1f24" :icon="['fas', 'times']" />
        </base-button>
      </section>
      <!-- end litter -->
    </div>
  </transition>
</template>

<script>
export default {
  name: "ModalContainer",
  props: {
    isShown: {
      type: Boolean,
      required: false,
      default: true,
    },
    modifier: {
      type: String,
      required: false,
      default: ""
    },
    className: {
      type: String,
      required: false,
      default: ""
    },
    containerClass: {
      type: String,
      required: false,
      default: ""
    },
    isBigCloseButton: {
      type: Boolean,
      required: false,
      default: false
    },
    closeButtonModifier: {
      type: String,
      required: false,
      default: "small"
    },
    smallLitter: {
      type: Boolean,
      required: false,
      default: false
    },
    onOpen: {
      type: Function,
      required: false,
      default: () => {}
    },
    onClose: {
      type: Function,
      required: false,
      default: () => {}
    },
    isLitterFitContent: {
      type: Boolean,
      required: false,
      default: true
    },
    
  },

  beforeMount() {
    this.onOpen();
  },

  methods: {
    closeModal() {
      this.$store.commit('popups/closePopups')
    },
  },

  watch: {
    isShown(value) {
      if (value === false) {
        this.onClose()
        this.$store.commit('popups/clearPopupPayload')
      }
    }
  },
};
</script>

<style lang="sass" scoped>
@import '~/assets/styles/config/_colors.sass'
@import '~/assets/styles/config/_easing.sass'

.popup
  min-width: 100vw
  min-height: 100vh
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  background-color: rgba($darkGray, .5)
  z-index: 10000
  overflow-y: auto
  height: 1px
  pointer-events: auto

.popupLitter
  height: auto
  margin: auto;
  transition-duration: 300ms
  transition-timing-function: $standart
  position: relative

  @media (--from-tablet)
    width: 320px

  @media (--until-tablet)
    width: 100%
  
  &__closeButton
    padding: 0 .5em;
    position: absolute;
    top: 25px;
    right: .5em;
    transition: color .2s $standart
    font-size: 2em;

    &:hover, &:focus

    &:after
      content: ""
      position: absolute
      top: 6px
      right: -2px
      border-radius: 25%
      background-color: rgba(0,0,0, .15)
      height: 75%
      width: 75%
      filter: blur(3px)
      z-index: -1
  
</style>
