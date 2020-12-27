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
      v-model.trim="sessionID"
    />
    <a
      v-if="isConnectedToSession"
      class="cope-session-id-to-clipboard"
      @click="copySessionToClipboard"
    >
      Copy
    </a>
  </div>
  <div
    v-if="showCopySuccess"
    class="copy-success"
  >
    ✔ Copied session ID
  </div>
  <button
    v-if="!isConnectedToSession"
    @click="joinSession"
    :disabled="!sessionIdIsValid"
  >
    Join session
  </button>
</template>

<script lang="ts">
import { sendMessageToActiveTab } from '../sendMessageToActiveTab'
import { asyncSendMessage } from '../../contentScript'
import { defineComponent, onMounted, ref, watch } from 'vue'


export default defineComponent(
  {
    name: 'ManageSession',
    setup: () => {
      const sessionID = ref('')
      const isConnectedToSession = ref(false)
      const showCopySuccess = ref(false)
      const showCopySuccessInfoTimeoutID = ref<NodeJS.Timeout | null>(null)
      const sessionIdIsValid = ref(false)
      const validationDebounceTimeout = ref<ReturnType<typeof setTimeout> | undefined>()

      const getCurrentStatus = () => {
        sendMessageToActiveTab({
          query: 'getConnectionStatus',
        }).then((result: { isConnected: boolean, sessionID: string }) => {
          isConnectedToSession.value = result.isConnected
          sessionID.value = result.sessionID
        })
      }
      onMounted(getCurrentStatus)

      const createSession = () => {
        sendMessageToActiveTab({
          query: 'createSession',
        }).then(({ success, sessionID }: { success: boolean, sessionID?: string }) => {
          if (success && sessionID) {
            sessionID.value = sessionID
            isConnectedToSession.value = true
          }
        })
      }

      const joinSession = () => {
        sendMessageToActiveTab({
          query: 'joinSession',
          sessionID: sessionID.value,
        }).then(() => {
          isConnectedToSession.value = true
        })
      }

      const leaveSession = () => {
        sendMessageToActiveTab({
          query: 'leaveSession',
        }).then(() => {
          sessionID.value = ''
          isConnectedToSession.value = false
        })
      }

      const copySessionToClipboard = () => {
        navigator.clipboard.writeText(sessionID.value)
          .then(() => {
            showCopySuccess.value = true

            if (showCopySuccessInfoTimeoutID.value) {
              clearTimeout(showCopySuccessInfoTimeoutID.value)
            }

            showCopySuccessInfoTimeoutID.value = setTimeout(() => {
              showCopySuccess.value = false
              showCopySuccessInfoTimeoutID.value = null
            }, 3000)
          })
      }

      const checkSession = async () => {
        const response = await asyncSendMessage({
          query: 'checkSession',
          sessionID: sessionID.value,
        })

        return typeof response === 'boolean' ? response : false
      }

      const validateSessionID = () => {
        if (validationDebounceTimeout.value) {
          clearTimeout(validationDebounceTimeout.value)
        }

        validationDebounceTimeout.value = setTimeout(() => {
          checkSession()
            .then(sessionIdExists => {
              sessionIdIsValid.value = sessionIdExists
            })
        }, 300)
      }

      watch(sessionID, () => {
        validateSessionID()
      })

      return {
        sessionID,
        isConnectedToSession,
        showCopySuccess,
        showCopySuccessInfoTimeoutID,
        sessionIdIsValid,
        validationDebounceTimeout,
        getCurrentStatus,
        createSession,
        joinSession,
        leaveSession,
        copySessionToClipboard,
      }
    },
  },
)
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

.copy-success {
  color: green;
  width: 100%;
  text-align: center;
}
</style>
