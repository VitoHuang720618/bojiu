<script setup lang="ts">
import { ref, computed } from 'vue'
import { assetManifest } from '../config/assetManifest'
import EditorToolbar from './EditorToolbar.vue'
import PreviewFrame from './PreviewFrame.vue'
import AssetPanel from './AssetPanel.vue'
import CarouselEditor from './CarouselEditor.vue'

// Editor state
const isEditMode = ref(true)
const selectedAssetPath = ref<string>('')
const showAssetPanel = ref(false)
const showCarouselEditor = ref(false)

// Notification state
const notifications = ref<Array<{ id: string; type: 'success' | 'error'; message: string }>>([])

// Static asset manifest
const currentAssetManifest = ref(assetManifest)

// Mock connection status for toolbar
const connectionStatus = computed(() => ({
  connected: true,
  reconnecting: false,
  error: null
}))

// Methods
const toggleMode = () => {
  isEditMode.value = !isEditMode.value
}

const selectAsset = (path: string) => {
  selectedAssetPath.value = path
  
  // 如果是輪播圖片，顯示輪播編輯器
  if (path === 'carouselSlides') {
    showCarouselEditor.value = true
    showAssetPanel.value = false
  } else {
    showAssetPanel.value = true
    showCarouselEditor.value = false
  }
}

const closeAssetPanel = () => {
  showAssetPanel.value = false
  selectedAssetPath.value = ''
}

const closeCarouselEditor = () => {
  showCarouselEditor.value = false
  selectedAssetPath.value = ''
}

const handleAssetUpdate = async (path: string, newUrl: string) => {
  try {
    // 上傳成功後，圖片已經以固定名稱保存
    // 只需要刷新頁面或添加時間戳來強制重新載入圖片
    const timestamp = Date.now()
    
    // 更新本地顯示（添加時間戳強制刷新）
    const manifest = { ...currentAssetManifest.value }
    const keys = path.split('.')
    let current: any = manifest
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    // 添加時間戳強制瀏覽器重新載入圖片
    const baseUrl = newUrl.split('?')[0]
    current[keys[keys.length - 1]] = `${baseUrl}?t=${timestamp}`
    
    currentAssetManifest.value = manifest
    
    // 關閉面板
    closeAssetPanel()
    
    // 顯示成功通知
    showNotification('success', `資源 ${path} 已成功更新`)
    
  } catch (error) {
    console.error('更新資源失敗:', error)
    showNotification('error', '更新資源失敗，請重試')
  }
}

const handleCarouselUpdate = async (newSlides: string[]) => {
  try {
    // 輪播圖片已經以固定名稱保存，添加時間戳強制刷新
    const timestamp = Date.now()
    const slidesWithTimestamp = newSlides.map(slide => {
      const baseUrl = slide.split('?')[0]
      return `${baseUrl}?t=${timestamp}`
    })
    
    // 更新本地狀態
    const manifest = { ...currentAssetManifest.value }
    manifest.carouselSlides = slidesWithTimestamp
    currentAssetManifest.value = manifest
    
    // 關閉輪播編輯器
    closeCarouselEditor()
    
    // 顯示成功通知
    showNotification('success', `輪播圖片已更新 (${newSlides.length} 張)`)
    
  } catch (error) {
    console.error('更新輪播圖片失敗:', error)
    showNotification('error', '更新輪播圖片失敗，請重試')
  }
}

const refreshManifest = () => {
  // 重新載入頁面以獲取最新圖片
  window.location.reload()
}

// Notification system
const showNotification = (type: 'success' | 'error', message: string) => {
  const id = Date.now().toString()
  notifications.value.push({ id, type, message })
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    removeNotification(id)
  }, 3000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Helper method to get nested asset value
const getAssetValue = (path: string): string => {
  const keys = path.split('.')
  let current: any = currentAssetManifest.value
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return ''
    }
  }
  
  return typeof current === 'string' ? current : ''
}
</script>

<template>
  <div class="wysiwyg-editor">
    <!-- Toolbar -->
    <EditorToolbar 
      :is-edit-mode="isEditMode"
      :connection-status="connectionStatus"
      @toggle-mode="toggleMode"
      @refresh-manifest="refreshManifest"
    />

    <!-- Main Editor Area -->
    <div class="editor-main">
      <!-- Preview Frame -->
      <div class="preview-container" :class="{ 'edit-mode': isEditMode }">
        <PreviewFrame 
          :asset-manifest="currentAssetManifest"
          :is-edit-mode="isEditMode"
          @select-asset="selectAsset"
        />
      </div>

      <!-- Asset Panel (Sidebar) -->
      <AssetPanel 
        v-if="showAssetPanel"
        :asset-path="selectedAssetPath"
        :current-url="selectedAssetPath ? getAssetValue(selectedAssetPath) : ''"
        @close="closeAssetPanel"
        @update="handleAssetUpdate"
      />

      <!-- Carousel Editor (Sidebar) -->
      <CarouselEditor 
        v-if="showCarouselEditor"
        :carousel-slides="currentAssetManifest.carouselSlides"
        :max-slides="5"
        @close="closeCarouselEditor"
        @update="handleCarouselUpdate"
      />
    </div>

    <!-- Notifications -->
    <div class="notifications">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="`notification--${notification.type}`"
          @click="removeNotification(notification.id)"
        >
          <span class="notification-icon">
            {{ notification.type === 'success' ? '✅' : '❌' }}
          </span>
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" @click.stop="removeNotification(notification.id)">
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-item">
        <span class="status-dot" :class="connectionStatus.connected ? 'connected' : 'disconnected'"></span>
        <span>{{ connectionStatus.connected ? '已連接' : '未連接' }}</span>
      </div>
      
      <div class="status-item">
        <span>模式: {{ isEditMode ? '編輯' : '預覽' }}</span>
      </div>
      
      <div class="status-item" v-if="selectedAssetPath">
        <span>選中: {{ selectedAssetPath === 'carouselSlides' ? '輪播圖片' : selectedAssetPath }}</span>
      </div>
    </div>
  </div>
</template>


<style scoped>
.wysiwyg-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.editor-main {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.preview-container {
  flex: 1;
  background: white;
  border-right: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.preview-container.edit-mode {
  cursor: crosshair;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #1f2937;
  color: white;
  font-size: 0.875rem;
  border-top: 1px solid #374151;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.status-dot.connected {
  background-color: #10b981;
}

.status-dot.disconnected {
  background-color: #ef4444;
}

/* Notifications */
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 300px;
  max-width: 400px;
}

.notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification--success {
  background: #10b981;
  color: white;
}

.notification--error {
  background: #ef4444;
  color: white;
}

.notification-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  opacity: 1;
}

/* Notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>