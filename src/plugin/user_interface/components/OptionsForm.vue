<template>
  <form @submit="() => {}">
    <fieldset name="general">
      <legend>
        General
      </legend>
      <label for="backend-url">
        Backend URL
      </label>
      <small class="error" :style="{
        visibility: backendUrlIsValid ? 'hidden' : 'visible'
      }">
        Please enter a valid URL! Perhaps you forgot the <code>https://</code>?
      </small>
      <input
        id="backend-url"
        type="url"
        v-model="backendURL"
      />
    </fieldset>
  </form>
  <small v-if="!backendUrlIsValid" class="error">
    Couldn't save settings because some values are invalid!
  </small>
  <small v-else-if="isSaving">
    Saving settings
  </small>
  <small v-else class="success">
    ✔ All settings saved! ({{ isSavingLastChanged.toLocaleTimeString() }})
  </small>
</template>

<script lang="ts">
import { defaultOptions, getOptions, saveOptions } from '../options'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

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

      const validateBackendUrl = (url: string): boolean => {
        try {
          new URL(url)
          return true
        } catch (e) {
          return false
        }
      }
      const backendUrlIsValid = computed(() => validateBackendUrl(backendURL.value))

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

      return { backendURL, isSaving, isSavingLastChanged, backendUrlIsValid }
    },
  },
)</script>

<style scoped lang="scss">
@use '../colors';

fieldset {
  border-radius: 5px;
}

.success {
  color: colors.$success;
}

.error {
  color: colors.$error;
}
</style>
