<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isEditMode: boolean
  connectionStatus: {
    connected: boolean
    reconnecting: boolean
    error: string | null
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleMode: []
  refreshManifest: []
}>()

const modeButtonText = computed(() => {
  return props.isEditMode ? '切換到預覽模式' : '切換到編輯模式'
})

const modeIcon = computed(() => {
  return props.isEditMode ? '👁️' : '✏️'
})

const connectionStatusText = computed(() => {
  if (props.connectionStatus.reconnecting) {
    return '重新連接中...'
  }
  return props.connectionStatus.connected ? '已連接到服務器' : '未連接到服務器'
})
</script>

<template>
  <div class="editor-toolbar">
    <div class="toolbar-section">
      <h2 class="toolbar-title">圖片編輯器</h2>
    </div>

    <div class="toolbar-section toolbar-center">
      <div class="connection-status" :class="{
        'connected': connectionStatus.connected,
        'reconnecting': connectionStatus.reconnecting,
        'disconnected': !connectionStatus.connected && !connectionStatus.reconnecting
      }">
        <div class="status-indicator"></div>
        <span>{{ connectionStatusText }}</span>
      </div>
    </div>

    <div class="toolbar-section">
      <div class="toolbar-actions">
        <button 
          @click="emit('toggleMode')" 
          class="btn btn-primary"
          :title="modeButtonText"
        >
          <span class="btn-icon">{{ modeIcon }}</span>
          {{ isEditMode ? '預覽' : '編輯' }}
        </button>

        <button 
          @click="emit('refreshManifest')" 
          class="btn btn-secondary"
          :disabled="!connectionStatus.connected"
          title="刷新資源配置"
        >
          <span class="btn-icon">🔄</span>
          刷新
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.toolbar-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.connection-status.connected .status-indicator {
  background-color: #10b981;
}

.connection-status.reconnecting .status-indicator {
  background-color: #f59e0b;
  animation: pulse 1s infinite;
}

.connection-status.disconnected .status-indicator {
  background-color: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  font-size: 1rem;
}
</style>