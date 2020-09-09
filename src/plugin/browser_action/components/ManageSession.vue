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
import { sendMessageToActiveTab } from '../sendMessageToActiveTab'

export default {
  name: 'ManageSession',
  data() {
    return {
      sessionID: '',
    }
  },
  methods: {
    createSession() {
      sendMessageToActiveTab({
        query: 'createSession',
      })
    },
    joinSession() {
      sendMessageToActiveTab({
        query: 'joinSession',
        sessionID: this.sessionID,
      })
    },
  },
}
</script>

<style scoped lang="scss">

</style>
