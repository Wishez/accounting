<template>
  <div class="slug-field">
    <slot />
    <base-field
      name="name"
      id="name"
      :labelText="nameLabelText"
      :value="name"
      :shouldDisplayInput="shouldDisplayName"
      :placeholder="namePlaceholderText"
      @input="setName"
    />
  
    <label for="slug" id="slugLabel">
      Ссылка
    </label>
    <input
      v-model="slug"
      :placeholder="slugPlaceholderText"
      type="text"
      name="slug"
      id="slug"
      maxlength="50"
      aria-describedby="slugLabel"
      v-on="slugListeners"
      required
    />
  </div>
</template>

<script>
export default {
  name: "SlugField",
  data: () => ({
    name: '',
    slug: '',
  }),
  props: {
    slugPlaceholderText: {
      type: String,
      default: "to-aa-bb-1",
    },
    namePlaceholderText: String,
    shouldDisplayName: {
      type: Boolean,
      default: true,
    },
    nameLabelText: String,
    slugValue: {
      type: String,
      default: '',
    },
    nameValue: {
      type: String,
      default: '',
    },
  },
  computed: {
    slugListeners() {
      var vm = this
      return Object.assign({}, this.$listeners,
        {
          input(event) {
            const formattedSlug = vm.$lodash.transliteText(event.target.value, '-')
            vm.slug = formattedSlug
            vm.$emit('slugInput', formattedSlug)
          },
        }
      )
    },

    nameListeners() {
      var vm = this
      return Object.assign({}, this.$listeners,
        {
          input(event) {
            const name = event.target.value
            const formattedSlug = vm.$lodash.transliteText(name, '-')
            vm.name = name
            vm.slug = formattedSlug
            vm.$emit('slugInput', formattedSlug)
            vm.$emit('nameInput', name)
          }
        }
      )
    },
  },

  methods: {
    setName(name) {
      const formattedSlug = this.$lodash.transliteText(name, '-')
      this.name = name
      this.slug = formattedSlug
      this.$emit('slugInput', formattedSlug)
      this.$emit('nameInput', name)
    }
  },

  mounted() {
    this.name = this.nameValue
    this.slug = this.slugValue
  }
}
</script>

<style lang="sass" scoped>
</style>