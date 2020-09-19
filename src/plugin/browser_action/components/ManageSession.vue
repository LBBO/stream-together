<template>
  <button
    v-if="!isConnectedToSession"
    @click="createSession"
  >
    Create session
  </button>
  <button
    v-else
    @click="leaveSession"
  >
    Leave session
  </button>
  <hr />
  <label for="sessionID">
    Session ID
  </label>
  <div class="session-id-wrapper">
    <input
      :disabled="isConnectedToSession"
      id="sessionID"
      type="text"
      v-model="sessionID"
    />
    <span
      v-if="isConnectedToSession"
      class="cope-session-id-to-clipboard"
      @click="copySessionToClipboard"
    >
      Copy
    </span>
  </div>
  <button
    v-if="!isConnectedToSession"
    @click="joinSession"
  >
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
      isConnectedToSession: false,
      showCopySuccess: false,
      timeoutID: null,
    }
  },
  mounted() {
    this.getCurrentStatus()
  },
  methods: {
    getCurrentStatus() {
      sendMessageToActiveTab({
        query: 'getConnectionStatus',
      }).then(({ isConnected, sessionID }: { isConnected: boolean, sessionID: string }) => {
        this.isConnectedToSession = isConnected
        this.sessionID = sessionID
      })
    },
    createSession() {
      sendMessageToActiveTab({
        query: 'createSession',
      }).then(({ success, sessionID }: { success: boolean, sessionID?: string }) => {
        if (success && sessionID) {
          this.sessionID = sessionID
          this.isConnectedToSession = true
        }
      })
    },
    joinSession() {
      sendMessageToActiveTab({
        query: 'joinSession',
        sessionID: this.sessionID,
      }).then(() => {
        this.isConnectedToSession = true
      })
    },
    leaveSession() {
      sendMessageToActiveTab({
        query: 'leaveSession',
      }).then(() => {
        this.sessionID = ''
        this.isConnectedToSession = false
      })
    },
    copySessionToClipboard() {
      navigator.clipboard.writeText(this.sessionID)
        .then(() => {
          this.showCopySuccess = true

          if (this.timeoutID) {
            clearTimeout(this.timeoutID)
          }

          this.timeoutID = setTimeout(() => {
            this.showCopySuccess = false
            this.timeoutID = null
          }, 3000)
        })
    },
  },
}
</script>

<style scoped lang="scss">
.session-id-wrapper {
  display: flex;
  flex-direction: row;

  input {
    flex-grow: 1;
  }

  .cope-session-id-to-clipboard {
    cursor: pointer;
    padding: 0.75em;
  }
}
</style>
