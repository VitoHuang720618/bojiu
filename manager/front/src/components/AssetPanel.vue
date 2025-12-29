<script setup lang="ts">
import { ref, computed } from 'vue'
import { EditableImageComponent } from '@b9-website/shared'

interface Props {
  assetPath: string
  currentUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  update: [path: string, newUrl: string]
}>()

const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref<string>('')
const uploadSuccess = ref(false)

const displayPath = computed(() => {
  return props.assetPath.replace(/\./g, ' → ')
})

const handleUploadStart = () => {
  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  uploadSuccess.value = false
}

const handleUploadProgress = (progress: number) => {
  uploadProgress.value = progress
}

const handleUploadSuccess = (newSrc: string) => {
  isUploading.value = false
  uploadSuccess.value = true
  uploadError.value = ''
  
  // Emit update event with the new URL
  emit('update', props.assetPath, newSrc)
  
  // Auto-close after success
  setTimeout(() => {
    emit('close')
  }, 1500)
}

const handleUploadError = (error: Error) => {
  isUploading.value = false
  uploadError.value = error.message
  uploadSuccess.value = false
}

const handleClose = () => {
  if (!isUploading.value) {
    emit('close')
  }
}
</script>

<template>
  <div class="asset-panel">
    <div class="panel-header">
      <h3 class="panel-title">編輯圖片資源</h3>
      <button 
        @click="handleClose" 
        class="close-btn"
        :disabled="isUploading"
        title="關閉面板"
      >
        ✕
      </button>
    </div>

    <div class="panel-content">
      <!-- Asset Info -->
      <div class="asset-info">
        <div class="info-row">
          <label class="info-label">資源路徑:</label>
          <span class="info-value">{{ displayPath }}</span>
        </div>
        
        <div class="info-row">
          <label class="info-label">當前 URL:</label>
          <span class="info-value url">{{ currentUrl || '未設定' }}</span>
        </div>
      </div>

      <!-- Current Image Preview -->
      <div class="current-preview" v-if="currentUrl">
        <h4 class="preview-title">當前圖片</h4>
        <div class="preview-container">
          <img :src="currentUrl" :alt="assetPath" class="preview-image" />
        </div>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <h4 class="section-title">上傳新圖片</h4>
        
        <EditableImageComponent
          :src="currentUrl"
          :alt="assetPath"
          :asset-path="assetPath"
          :asset-type="'single'"
          :upload-endpoint="`http://localhost:3005/api/upload`"
          :editable="true"
          @upload-start="handleUploadStart"
          @upload-progress="handleUploadProgress"
          @upload-complete="handleUploadSuccess"
          @upload-error="handleUploadError"
          class="editable-image"
        />

        <!-- Upload Status -->
        <div v-if="isUploading" class="upload-status">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
          <p class="status-text">上傳中... {{ uploadProgress }}%</p>
        </div>

        <div v-if="uploadError" class="upload-error">
          <span class="error-icon">⚠️</span>
          <span>{{ uploadError }}</span>
        </div>

        <div v-if="uploadSuccess" class="upload-success">
          <span class="success-icon">✅</span>
          <span>上傳成功！正在更新...</span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <h4 class="section-title">使用說明</h4>
        <ul class="instruction-list">
          <li>點擊圖片區域選擇新的圖片文件</li>
          <li>支援 JPG、PNG、GIF 格式</li>
          <li>建議圖片大小不超過 5MB</li>
          <li>上傳完成後會自動更新預覽</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asset-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.asset-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.info-value {
  font-size: 0.875rem;
  color: #6b7280;
  word-break: break-all;
}

.info-value.url {
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.current-preview {
  margin-bottom: 1.5rem;
}

.preview-title,
.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f9fafb;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.editable-image {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.editable-image:hover {
  border-color: #3b82f6;
}

.upload-status {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.status-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.upload-error,
.upload-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.upload-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.upload-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.instructions {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.instruction-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.instruction-list li {
  margin-bottom: 0.25rem;
}
</style>