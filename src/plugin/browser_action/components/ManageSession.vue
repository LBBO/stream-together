<template>
  <button @click="createSession">
    Create session
  </button>
  <hr />
  <label for="sessionID">
    Session ID
  </label>
  <input id="sessionID" type="text" v-model="sessionID" />
  <button @click="joinSession">
    Join session
  </button>
</template>

<script lang="ts">
export default {
  name: 'ManageSession',
  data() {
    return {
      sessionID: '',
    }
  },
  methods: {
    createSession() {
      console.log('create session')
    },
    joinSession() {
      console.log('join session', this.sessionID)
    }
  },
}
</script>

<style scoped lang="scss">

</style>
