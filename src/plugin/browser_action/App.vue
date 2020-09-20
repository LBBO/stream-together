<template>
  <div class="browser_action">
    <OptionsLink />
    <h1>Stream Together</h1>
    <ManageSession />
  </div>
</template>

<script lang="ts">
import ManageSession from './components/ManageSession.vue'
import OptionsLink from './components/OptionsLink.vue'
export default {
  name: 'App',
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

<style lang="scss">
@font-face {
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  src: url('assets/Roboto/Roboto-Regular.ttf');
}

html, body {
  font-family: "Roboto", Arial, sans-serif;
  padding: 0;
  margin: 0;
  min-height: 100vh;

  input:disabled {
    color: #AAA;
  }
}

* {
  box-sizing: border-box;
}
</style>
