<template>
  <div class="color-field">
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
  </div>
</template>

<script>
import ColorPicker from '@radial-color-picker/vue-color-picker'

export default {
  name: "ColorField",
  components: {
    ColorPicker,
  },
  props: {
    entity: {
      type: Object,
      default: () => ({ color: '' }),
    },
  },
  computed: {
    baseColor() {
      const { color } = this.entity
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

  data: () => ({
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
  }),

  methods: {

    setColor() {
      this.color = { ...this.baseColor }
    },

    selectColor(colorHue) {
      this.color.hue = colorHue
      this.chooseColor.hue = colorHue
      let color = '#ffffff'
      const { saturation, luminosity } = this.color
      if (luminosity === 50) {
        color = this.$lodash.getHexFromHsl(colorHue, saturation, luminosity)
      } else if (luminosity === 0) {
        color = '#333333'
      }
      this.$emit('changeColor', color)
    },

    changeColor() {
      this.selectColor(this.color.hue)
    },
  },
}
</script>

<style lang="scss" scoped>
.color-field {
  width: 100%
}
</style>