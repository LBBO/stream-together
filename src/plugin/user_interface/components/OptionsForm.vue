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
  <small :class="isSaving ? '' : 'success'">
    {{isSaving ? 'Saving settings...' : `✔ All settings saved! (${isSavingLastChanged.toLocaleTimeString()})`}}
  </small>
</template>

<script lang="ts">
import { defaultOptions, getOptions, saveOptions } from '../options'
import { defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
    name: 'OptionsForm',
    props: {
      msg: String,
    },
    setup: () => {
      const backendURL = ref(defaultOptions.backendURL)
      const isSaving = ref(false)
      const isSavingLastChanged = ref(new Date())

      const setIsSaving = (newValue: boolean) => {
        const now = new Date()

        isSaving.value = newValue
        isSavingLastChanged.value = now

        return now
      }

      const setIsSavingIfHasntChangedSince = (newValue: boolean, date = new Date()) => {
        const now = new Date()

        if (date.valueOf() >= isSavingLastChanged.value.valueOf()) {
          isSaving.value = newValue
          isSavingLastChanged.value = now
        }

        return now
      }

      watch(backendURL, async () => {
        const beginningOfSaving = setIsSaving(true)
        isSaving.value = true
        await saveOptions({
          ...defaultOptions,
          backendURL: backendURL.value,
        })
        setIsSavingIfHasntChangedSince(false, beginningOfSaving)
      })

      onMounted(async () => {
        const options = await getOptions()
        backendURL.value = options.backendURL
      })

      return { backendURL, isSaving, isSavingLastChanged }
    },
  },
)</script>

<style scoped lang="scss">
fieldset {
  border-radius: 5px;
}

.success {
  color: green;
}
</style>
