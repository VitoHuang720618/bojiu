<template>
  <div 
    class="editable-image-component" 
    :class="containerClass"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 基礎圖片組件 -->
    <ImageComponent
      :src="src"
      :alt="alt"
      :loading="loading"
      :fallback="fallback"
      :className="imageClassName"
      :style="style"
      :showRetry="showRetry"
      :preload="preload"
      @load="handleImageLoad"
      @error="handleImageError"
      @click="handleImageClick"
      @retry="handleImageRetry"
    />
    
    <!-- 編輯覆蓋層 -->
    <div 
      v-if="editable && (isHovered || isUploading)" 
      class="edit-overlay"
      :class="overlayClass"
      @click="handleEditClick"
    >
      <div class="edit-content">
        <!-- 編輯提示 -->
        <div v-if="!isUploading" class="edit-hint">
          <div class="edit-icon">📷</div>
          <span class="edit-text">點擊更換圖片</span>
        </div>
        
        <!-- 上傳進度 -->
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-spinner"></div>
          <span class="progress-text">上傳中... {{ uploadProgress }}%</span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpg,image/jpeg"
      style="display: none"
      @change="handleFileSelect"
    />
    
    <!-- 成功提示 -->
    <Transition name="success-toast">
      <div v-if="showSuccessToast" class="success-toast">
        <div class="success-icon">✅</div>
        <span class="success-text">圖片更新成功</span>
      </div>
    </Transition>
    
    <!-- 錯誤提示 -->
    <Transition name="error-toast">
      <div v-if="showErrorToast" class="error-toast">
        <div class="error-icon">❌</div>
        <span class="error-text">{{ uploadError }}</span>
        <button @click="hideErrorToast" class="close-button">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ImageComponent from './ImageComponent.vue'
import type { EditableImageProps } from '../types'
import { validateImageFile } from '../utils/validation'

interface Props extends EditableImageProps {
  showRetry?: boolean
  preload?: boolean
  maxFileSize?: number
  allowedFormats?: string[]
}

interface Emits {
  load: [event: Event]
  error: [error: Error]
  click: [event: MouseEvent]
  retry: []
  uploadStart: [assetPath: string]
  uploadProgress: [progress: number]
  uploadComplete: [newSrc: string]
  uploadError: [error: Error]
  editClick: [assetPath: string]
}

const props = withDefaults(defineProps<Props>(), {
  showRetry: true,
  preload: false,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: () => ['image/png', 'image/jpg', 'image/jpeg']
})

const emit = defineEmits<Emits>()

// 響應式狀態
const isHovered = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const uploadError = ref('')
const fileInputRef = ref<HTMLInputElement>()

// 計算屬性
const containerClass = computed(() => [
  'editable-image-component',
  {
    'editable-image-component--editable': props.editable,
    'editable-image-component--hovered': isHovered.value,
    'editable-image-component--uploading': isUploading.value
  }
])

const imageClassName = computed(() => {
  const classes = ['editable-image-component__image']
  if (props.className) {
    classes.push(props.className)
  }
  return classes.join(' ')
})

const overlayClass = computed(() => [
  'edit-overlay',
  {
    'edit-overlay--uploading': isUploading.value,
    'edit-overlay--hovered': isHovered.value && !isUploading.value
  }
])

// 滑鼠事件處理
const handleMouseEnter = () => {
  if (props.editable && !isUploading.value) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  if (!isUploading.value) {
    isHovered.value = false
  }
}

// 圖片事件處理
const handleImageLoad = (event: Event) => {
  emit('load', event)
}

const handleImageError = (error: Error) => {
  emit('error', error)
}

const handleImageClick = (event: MouseEvent) => {
  if (!props.editable) {
    emit('click', event)
  }
}

const handleImageRetry = () => {
  emit('retry')
}

// 編輯點擊處理
const handleEditClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (isUploading.value) return
  
  emit('editClick', props.assetPath)
  
  // 觸發檔案選擇
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 檔案選擇處理
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    // 驗證檔案
    const validation = validateImageFile(file, {
      maxSize: props.maxFileSize,
      allowedTypes: props.allowedFormats
    })
    
    if (!validation.isValid) {
      throw new Error(validation.error || '檔案驗證失敗')
    }
    
    // 開始上傳
    await uploadFile(file)
    
  } catch (error) {
    handleUploadError(error as Error)
  } finally {
    // 清空檔案輸入
    if (target) {
      target.value = ''
    }
  }
}

// 檔案上傳處理
const uploadFile = async (file: File) => {
  isUploading.value = true
  uploadProgress.value = 0
  hideToasts()
  
  emit('uploadStart', props.assetPath)
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('assetPath', props.assetPath)
    formData.append('assetType', props.assetType)
    
    const response = await fetch(props.uploadEndpoint, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`上傳失敗: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '上傳失敗')
    }
    
    // 模擬進度更新
    await simulateProgress()
    
    // 上傳成功
    emit('uploadComplete', result.data.path)
    showSuccessToast.value = true
    
    // 自動隱藏成功提示
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
    
  } catch (error) {
    handleUploadError(error as Error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    isHovered.value = false
  }
}

// 模擬上傳進度
const simulateProgress = async () => {
  const steps = [20, 40, 60, 80, 95, 100]
  
  for (const step of steps) {
    uploadProgress.value = step
    emit('uploadProgress', step)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

// 錯誤處理
const handleUploadError = (error: Error) => {
  uploadError.value = error.message
  showErrorToast.value = true
  emit('uploadError', error)
}

// 隱藏提示
const hideToasts = () => {
  showSuccessToast.value = false
  showErrorToast.value = false
}

const hideErrorToast = () => {
  showErrorToast.value = false
}

// 監聽 editable 屬性變化
watch(() => props.editable, (newValue) => {
  if (!newValue) {
    isHovered.value = false
  }
})
</script>

<style scoped>
.editable-image-component {
  position: relative;
  display: inline-block;
  cursor: default;
}

.editable-image-component--editable {
  cursor: pointer;
}

.editable-image-component__image {
  transition: all 0.3s ease;
}

.editable-image-component--hovered .editable-image-component__image {
  filter: brightness(0.8);
}

.editable-image-component--uploading .editable-image-component__image {
  filter: brightness(0.6);
}

/* 編輯覆蓋層 */
.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(2px);
}

.edit-overlay--hovered {
  opacity: 1;
}

.edit-overlay--uploading {
  opacity: 1;
  cursor: default;
}

.edit-content {
  text-align: center;
  color: white;
  padding: 16px;
}

/* 編輯提示 */
.edit-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  font-size: 32px;
  opacity: 0.9;
}

.edit-text {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

/* 上傳進度 */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.progress-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 成功提示 */
.success-toast {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #10b981;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 10;
}

.success-icon {
  font-size: 16px;
}

/* 錯誤提示 */
.error-toast {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ef4444;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  z-index: 10;
  max-width: 300px;
}

.error-icon {
  font-size: 16px;
}

.error-text {
  flex: 1;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

/* 動畫 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 提示動畫 */
.success-toast-enter-active,
.success-toast-leave-active,
.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s ease;
}

.success-toast-enter-from,
.success-toast-leave-to,
.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .edit-icon {
    font-size: 24px;
  }
  
  .edit-text {
    font-size: 12px;
  }
  
  .upload-progress {
    min-width: 150px;
  }
  
  .progress-text {
    font-size: 12px;
  }
  
  .progress-spinner {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }
  
  .success-toast,
  .error-toast {
    font-size: 12px;
    padding: 8px 12px;
    max-width: 250px;
  }
}

/* 無障礙支援 */
@media (prefers-reduced-motion: reduce) {
  .progress-spinner {
    animation: none;
  }
  
  .edit-overlay,
  .editable-image-component__image,
  .progress-fill {
    transition: none;
  }
}

/* 高對比模式支援 */
@media (prefers-contrast: high) {
  .edit-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .progress-bar {
    background: rgba(255, 255, 255, 0.5);
  }
}
</style>