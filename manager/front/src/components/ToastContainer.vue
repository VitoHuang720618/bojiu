<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="toast in store.toasts" :key="toast.id" class="toast-item" :class="toast.type"
        @click="store.remove(toast.id)">
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else-if="toast.type === 'warning'">!</span>
          <span v-else>i</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '../stores/toastStore'

const store = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  /* Allow clicking through container */
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-left: 4px solid #ccc;
  font-size: 0.95rem;
}

.toast-item.success {
  border-left-color: #28a745;
  background-color: #f0fff4;
  color: #155724;
}

.toast-item.error {
  border-left-color: #dc3545;
  background-color: #fff5f5;
  color: #721c24;
}

.toast-item.warning {
  border-left-color: #ffc107;
  background-color: #fffbf0;
  color: #856404;
}

.toast-item.info {
  border-left-color: #17a2b8;
  background-color: #f0fbff;
  color: #0c5460;
}

.toast-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
