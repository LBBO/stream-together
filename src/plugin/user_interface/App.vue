<template>
  <router-view />
</template>

<script lang="ts">
export default {
  name: 'App',
}
</script>

<style lang="scss">
@font-face {
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  src: url('assets/Roboto/Roboto-Regular.ttf');
}

html,
body {
  font-family: 'Roboto', Arial, sans-serif;
  padding: 0;
  margin: 0;
  min-height: 100vh;

  input:disabled {
    color: #aaa;
  }
}

* {
  box-sizing: border-box;
}
</style>
