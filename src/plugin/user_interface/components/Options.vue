<template>
  <div class="options-page">
    <h1>Stream Together - Options</h1>
    <aside class="save-notice">All settings are saved automatically.</aside>
    <OptionsForm />
  </div>
</template>

<script lang="ts">
import OptionsForm from './OptionsForm.vue'

export default {
  name: 'Options',
  components: {
    OptionsForm,
  },
}
</script>

<style scoped lang="scss">
.options-page {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(min-content, 800px);
  justify-content: center;

  h1 {
    box-sizing: border-box;
    margin-bottom: 0.3em;
    font-size: 2.5em;
  }

  .save-notice {
    margin-bottom: 2em;
    font-size: 0.9em;
    font-style: italic;
  }
}
</style>
