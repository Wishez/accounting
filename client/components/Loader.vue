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
      padding-bottom: 1.25em;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(#fff, .7);
      z-index: 100;
    }
  }
</style>
