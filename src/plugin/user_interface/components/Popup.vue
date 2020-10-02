<template>
  <div class="browser_action">
    <OptionsLink />
    <h1>Stream Together</h1>
    <ManageSession />
  </div>
</template>

<script lang="ts">
import ManageSession from './ManageSession.vue'
import OptionsLink from './OptionsLink.vue'

export default {
  name: 'Popup',
  components: {
    OptionsLink,
    ManageSession,
  },
}
</script>

<style scoped lang="scss">
.browser_action {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(min-content, 800px);
  justify-content: center;
  padding: 2em;

  h1 {
    box-sizing: border-box;
    margin-bottom: 0.3em;
    font-size: 2.5em;
  }
}
</style>
