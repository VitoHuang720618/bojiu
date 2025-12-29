<script setup lang="ts">
import { ref, computed } from 'vue'
import { EditableImageComponent } from '@b9-website/shared'

interface Props {
  carouselSlides: string[]
  maxSlides?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSlides: 5
})

const emit = defineEmits<{
  close: []
  update: [slides: string[]]
}>()

const slides = ref<string[]>([...props.carouselSlides])
const isUploading = ref<boolean[]>(new Array(props.maxSlides).fill(false))
const uploadProgress = ref<number[]>(new Array(props.maxSlides).fill(0))
const uploadErrors = ref<string[]>(new Array(props.maxSlides).fill(''))

const canAddSlide = computed(() => slides.value.length < props.maxSlides)
const hasChanges = computed(() => {
  return JSON.stringify(slides.value) !== JSON.stringify(props.carouselSlides)
})

// 添加新的輪播圖片槽位
const addSlide = () => {
  if (canAddSlide.value) {
    slides.value.push('')
  }
}

// 移除輪播圖片
const removeSlide = (index: number) => {
  if (slides.value.length > 1) {
    slides.value.splice(index, 1)
    // 同時清理對應的狀態
    isUploading.value.splice(index, 1)
    uploadProgress.value.splice(index, 1)
    uploadErrors.value.splice(index, 1)
  }
}

// 上移輪播圖片
const moveSlideUp = (index: number) => {
  if (index > 0) {
    const temp = slides.value[index]
    slides.value[index] = slides.value[index - 1]
    slides.value[index - 1] = temp
  }
}

// 下移輪播圖片
const moveSlideDown = (index: number) => {
  if (index < slides.value.length - 1) {
    const temp = slides.value[index]
    slides.value[index] = slides.value[index + 1]
    slides.value[index + 1] = temp
  }
}

// 上傳處理函數
const handleUploadStart = (index: number) => {
  isUploading.value[index] = true
  uploadProgress.value[index] = 0
  uploadErrors.value[index] = ''
}

const handleUploadProgress = (index: number, progress: number) => {
  uploadProgress.value[index] = progress
}

const handleUploadSuccess = (index: number, newSrc: string) => {
  isUploading.value[index] = false
  slides.value[index] = newSrc
  uploadErrors.value[index] = ''
}

const handleUploadError = (index: number, error: Error) => {
  isUploading.value[index] = false
  uploadErrors.value[index] = error.message
}

// 保存變更
const saveChanges = () => {
  // 過濾掉空的圖片URL
  const validSlides = slides.value.filter(slide => slide.trim() !== '')
  emit('update', validSlides)
}

// 重置變更
const resetChanges = () => {
  slides.value = [...props.carouselSlides]
  // 重置所有狀態
  isUploading.value.fill(false)
  uploadProgress.value.fill(0)
  uploadErrors.value.fill('')
}

const handleClose = () => {
  if (hasChanges.value) {
    if (confirm('有未保存的變更，確定要關閉嗎？')) {
      emit('close')
    }
  } else {
    emit('close')
  }
}
</script>

<template>
  <div class="carousel-editor">
    <div class="panel-header">
      <h3 class="panel-title">編輯輪播圖片</h3>
      <button 
        @click="handleClose" 
        class="close-btn"
        title="關閉面板"
      >
        ✕
      </button>
    </div>

    <div class="panel-content">
      <!-- 輪播圖片列表 -->
      <div class="slides-list">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="slide-item"
          :class="{ 'uploading': isUploading[index] }"
        >
          <div class="slide-header">
            <span class="slide-number">圖片 {{ index + 1 }}</span>
            <div class="slide-controls">
              <button 
                @click="moveSlideUp(index)" 
                :disabled="index === 0"
                class="control-btn"
                title="上移"
              >
                ↑
              </button>
              <button 
                @click="moveSlideDown(index)" 
                :disabled="index === slides.length - 1"
                class="control-btn"
                title="下移"
              >
                ↓
              </button>
              <button 
                @click="removeSlide(index)" 
                :disabled="slides.length <= 1"
                class="control-btn remove-btn"
                title="移除"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 圖片預覽 -->
          <div class="slide-preview" v-if="slide">
            <img :src="slide" :alt="`輪播圖片 ${index + 1}`" class="preview-image" />
          </div>

          <!-- 上傳區域 -->
          <div class="upload-area">
            <EditableImageComponent
              :src="slide"
              :alt="`輪播圖片 ${index + 1}`"
              :asset-path="`carouselSlides.${index}`"
              :asset-type="'carousel'"
              :upload-endpoint="`http://localhost:3005/api/upload`"
              :editable="true"
              @upload-start="() => handleUploadStart(index)"
              @upload-progress="(progress) => handleUploadProgress(index, progress)"
              @upload-complete="(newSrc) => handleUploadSuccess(index, newSrc)"
              @upload-error="(error) => handleUploadError(index, error)"
              class="editable-image"
            />

            <!-- 上傳狀態 -->
            <div v-if="isUploading[index]" class="upload-status">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${uploadProgress[index]}%` }"
                ></div>
              </div>
              <p class="status-text">上傳中... {{ uploadProgress[index] }}%</p>
            </div>

            <div v-if="uploadErrors[index]" class="upload-error">
              <span class="error-icon">⚠️</span>
              <span>{{ uploadErrors[index] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加新圖片按鈕 -->
      <div class="add-slide-section" v-if="canAddSlide">
        <button @click="addSlide" class="add-slide-btn">
          <span class="add-icon">+</span>
          添加輪播圖片 ({{ slides.length }}/{{ maxSlides }})
        </button>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <button 
          @click="resetChanges" 
          class="btn btn-secondary"
          :disabled="!hasChanges"
        >
          重置
        </button>
        <button 
          @click="saveChanges" 
          class="btn btn-primary"
          :disabled="!hasChanges"
        >
          保存變更
        </button>
      </div>

      <!-- 使用說明 -->
      <div class="instructions">
        <h4 class="section-title">使用說明</h4>
        <ul class="instruction-list">
          <li>最多可設定 {{ maxSlides }} 張輪播圖片</li>
          <li>使用 ↑↓ 按鈕調整圖片順序</li>
          <li>點擊圖片區域上傳新圖片</li>
          <li>支援 JPG、PNG、GIF 格式</li>
          <li>建議圖片尺寸保持一致</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-editor {
  position: absolute;
  top: 0;
  right: 0;
  width: 500px;
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

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.panel-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.slides-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.slide-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.slide-item.uploading {
  border-color: #3b82f6;
  background: #eff6ff;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.slide-number {
  font-weight: 600;
  color: #374151;
}

.slide-controls {
  display: flex;
  gap: 0.25rem;
}

.control-btn {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  min-width: 1.5rem;
  text-align: center;
}

.control-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.remove-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
}

.slide-preview {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.upload-area {
  position: relative;
}

.editable-image {
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
  min-height: 120px;
}

.editable-image:hover {
  border-color: #3b82f6;
}

.upload-status {
  margin-top: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.status-text {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.add-slide-section {
  margin-bottom: 1.5rem;
}

.add-slide-btn {
  width: 100%;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.add-slide-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.add-icon {
  font-size: 1.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.instructions {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
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