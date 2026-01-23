<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-mask">
      <div class="modal-wrapper" @click.self="handleCancel">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ title }}</h3>
          </div>

          <div class="modal-body">
            <p>{{ message }}</p>
            <p v-if="subMessage" class="sub-message">{{ subMessage }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="handleCancel">
              取消
            </button>
            <button class="btn btn-primary" @click="handleConfirm">
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const subMessage = ref('')
let resolvePromise: ((value: boolean) => void) | null = null

const open = (titleText: string, messageText: string, subMessageText = '') => {
  title.value = titleText
  message.value = messageText
  subMessage.value = subMessageText
  isOpen.value = true
  return new Promise<boolean>((resolve) => {
    resolvePromise = resolve
  })
}

const handleConfirm = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(true)
}

const handleCancel = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ open })
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.modal-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  width: 400px;
  max-width: 90%;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  padding: 24px;
  color: #fff;
}

.modal-header h3 {
  margin-top: 0;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  margin: 20px 0;
  color: #ccc;
  line-height: 1.6;
}

.sub-message {
  font-size: 0.9em;
  color: #888;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
}

/* Modal Transition */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
