<template>
  <a
    href="#"
    class="gear"
    @click="openOptions"
  >
    ⚙
  </a>
</template>

<script lang="ts">
export default {
  name: 'OptionsLink',
  setup() {
    const openOptions = () => {
      chrome.runtime.openOptionsPage()
    }

    return {
      openOptions,
    }
  },
}
</script>

<style scoped lang="scss">
.gear {
  position: absolute;
  top: 1em;
  right: 1em;
  font-size: 1.5em;
  line-height: 1em;
}
</style>
