<template>
  <form @submit="() => {}">
    <fieldset name="general">
      <legend>
        General
      </legend>
      <label>
        Backend URL:
        <input
          type="text"
          v-model="backendURL"
        />
      </label>
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
