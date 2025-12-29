<script setup lang="ts">
import WysiwygEditor from '../components/WysiwygEditor.vue'
</script>

<template>
  <div class="editor-view">
    <div class="editor-header">
      <h1 class="editor-title">所見即所得圖片編輯器</h1>
      <div class="editor-actions">
        <router-link to="/dashboard" class="btn btn-secondary">
          返回儀表板
        </router-link>
      </div>
    </div>

    <div v-if="false" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在載入編輯器...</p>
    </div>

    <WysiwygEditor />
  </div>
</template>

<style scoped>
.editor-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
}

.editor-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: 1px solid #6b7280;
}

.btn-secondary:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>