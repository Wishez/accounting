<template>
  <base-button :action="chooseFile" class="action-button" unstyled>
    <input
      ref="file"
      type="file"
      name="fileUpload"
      class="upload-file-button"
      @change="onFileChange"
    />
    <slot />
  </base-button>
</template>

<script>
import axios from 'axios'
export default {
  name: 'UploadFileButton',
  props: {
    target: {
      type: String,
      required: true,
    },
  },

  data () {
    return {
      file: null
    }
  },

  methods: {
    chooseFile() {
      this.$refs.file.click()
    },

    onFileChange(e) {
      this.file = this.$refs.file.files[0]
      if (!this.file) return

      this.$emit('upload-started')

      const formData = new FormData()
      formData.append('file', this.file)
      axios.post(this.target, formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${this.$cookies.get('access_token')}`,
          }
        }
      ).then((response) => this.$emit('upload-finished', response.data))
      .catch(() => this.$emit('upload-failure'))

      this.file = null
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-file-button {
  display: none;
}
</style>
