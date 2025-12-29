<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  assetManifest: Record<string, any>
  isEditMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectAsset: [path: string]
}>()

const isLoading = ref(true)
const loadError = ref<string>('')
const scale = ref(1)
const minScale = 0.3
const maxScale = 2

// Demo application URL
const demoUrl = 'http://localhost:3002'

// Handle iframe load
const handleIframeLoad = () => {
  isLoading.value = false
  loadError.value = ''
}

// Handle iframe error
const handleIframeError = () => {
  isLoading.value = false
  loadError.value = '無法載入預覽頁面，請確認 Demo 應用正在運行'
}

// Simplified click handling - just emit basic asset paths
const handleImageClick = (assetPath: string) => {
  if (props.isEditMode) {
    emit('selectAsset', assetPath)
  }
}

// Zoom controls
const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value = Math.min(maxScale, scale.value + 0.1)
  }
}

const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value = Math.max(minScale, scale.value - 0.1)
  }
}

const resetZoom = () => {
  scale.value = 1
}

const fitToScreen = () => {
  scale.value = 0.8
}
</script>

<template>
  <div class="preview-frame">
    <!-- Zoom Controls -->
    <div class="zoom-controls">
      <button @click="zoomOut" :disabled="scale <= minScale" class="zoom-btn" title="縮小">
        🔍-
      </button>
      <span class="zoom-display">{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn" :disabled="scale >= maxScale" class="zoom-btn" title="放大">
        🔍+
      </button>
      <button @click="resetZoom" class="zoom-btn" title="重置縮放">
        1:1
      </button>
      <button @click="fitToScreen" class="zoom-btn" title="適合螢幕">
        📐
      </button>
    </div>
    <!-- Loading State -->
    <div v-if="isLoading" class="preview-loading">
      <div class="loading-spinner"></div>
      <p>正在載入預覽...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="preview-error">
      <div class="error-icon">⚠️</div>
      <h3>載入失敗</h3>
      <p>{{ loadError }}</p>
      <button @click="() => { isLoading = true; loadError = '' }" class="retry-btn">
        重試
      </button>
    </div>

    <!-- Preview Iframe Container -->
    <div class="iframe-container">
      <iframe
        v-show="!isLoading && !loadError"
        :src="demoUrl"
        @load="handleIframeLoad"
        @error="handleIframeError"
        class="preview-iframe"
        :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
        frameborder="0"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>

    <!-- Edit Mode Overlay -->
    <div v-if="isEditMode && !isLoading && !loadError" class="edit-overlay">
      <div class="edit-hint">
        <span class="edit-icon">✏️</span>
        編輯模式 - 點擊下方按鈕選擇要編輯的圖片
      </div>
      
      <!-- Quick Asset Selection Buttons -->
      <div class="asset-buttons">
        <button @click="handleImageClick('logo')" class="asset-btn">Logo</button>
        <button @click="handleImageClick('banner')" class="asset-btn">Banner</button>
        <button @click="handleImageClick('buttonLinks.0.default')" class="asset-btn">按鈕1</button>
        <button @click="handleImageClick('carouselSlides')" class="asset-btn">輪播圖片</button>
        <button @click="handleImageClick('toolIcons.0.default')" class="asset-btn">工具圖標</button>
        <button @click="handleImageClick('floatAdButtons.0.default')" class="asset-btn">浮動廣告</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  overflow: hidden;
}

.zoom-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 20;
  backdrop-filter: blur(4px);
}

.zoom-btn {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  min-width: 2rem;
  text-align: center;
}

.zoom-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-display {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  min-width: 3rem;
  text-align: center;
}

.iframe-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.preview-iframe {
  width: 100vw;
  height: 100vh;
  border: none;
  transition: transform 0.3s ease;
  display: block;
}

.preview-iframe.edit-mode {
  filter: brightness(0.95);
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
}

.preview-error h3 {
  margin: 0;
  color: #ef4444;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.edit-hint {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-icon {
  font-size: 1rem;
}

.asset-buttons {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
}

.asset-btn {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.asset-btn:hover {
  background: rgba(37, 99, 235, 0.9);
  transform: translateY(-1px);
}
</style>