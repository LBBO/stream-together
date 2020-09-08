<template>
  <form @submit="() => {}">
    <fieldset name="general">
      <legend>
        General
      </legend>
      <label for="backend-url">
        Backend URL
      </label>
      <input
        id="backend-url"
        type="url"
        v-model="backendURL"
      />
    </fieldset>
  </form>
</template>

<script lang="ts">
import { defaultOptions, getOptions, Options, saveOptions } from '../options'

export default {
  name: 'OptionsForm',
  props: {
    msg: String,
  },
  data(): Options {
    return defaultOptions
  },
  created() {
    getOptions()
      .then(options => {
        const keys = Object.keys(options) as Array<keyof Options>

        keys.forEach(key => {
          this[key] = options[key]
        })
      })
  },
  watch: {
    backendURL() {
      saveOptions(this.$data)
    },
  },
}
</script>

<style scoped lang="scss">
fieldset {
  border-radius: 5px;
}
</style>
