<template>
  <div :class="{ 'logo-holder': true, logo_loader: shouldRotateLogo }">
    <img 
      :class="{
        logo: true,
        rotate: shouldRotateLogo,
      }"
      :src="appLogo"
      alt="Logo"
    />
  </div>
</template>

<script>
import appLogo from '~/assets/logo.svg'
export default {
  name: "Loader",
  data: () => ({
    appLogo
  }),
  props: {
    shouldRotateLogo: {
      type: Boolean,
      default: true,
    }
  }

}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/config/_colors.sass';
  @keyframes rotate {
    to {
      transform: rotate(360deg)
    }
  }

  .rotate {
    will-change: transform;
    transform: rotate(0deg);
    transform-origin: center;
    animation: rotate infinite linear .6s;
  }

  .logo-holder {
    display: inline-block;
  }

  .logo {
    width: 45px;
    position: relative;
    top: 6px;
    display: inline-block;

    &_loader {
      width: calc(100% + 1em);
      height: calc(100% + 1em);
      position: absolute;
      top: -.5em;
      left: -.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(#fff, .7);
      z-index: 100;
    }
  }
</style>
