<template>
  <div class="image-component" :class="containerClass">
    <img
      v-if="state === 'loaded' || state === 'loading'"
      :src="currentSrc"
      :alt="alt"
      :loading="loading"
      :class="imageClass"
      :style="style"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />
    
    <!-- 載入狀態 -->
    <div v-if="state === 'loading'" class="image-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">載入中...</span>
    </div>
    
    <!-- 錯誤狀態 -->
    <div v-if="state === 'error'" class="image-error">
      <div class="error-icon">⚠️</div>
      <span class="error-text">圖片載入失敗</span>
      <button v-if="showRetry" @click="handleRetry" class="retry-button">
        重試
      </button>
    </div>
    
    <!-- 預設佔位圖片 -->
    <img
      v-if="state === 'error' && fallback"
      :src="fallback"
      :alt="alt"
      :class="imageClass"
      :style="style"
      @click="handleClick"
      class="fallback-image"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useImageLoader } from '../composables/useImageLoader'
import type { ImageComponentProps } from '../types'
import { DEFAULT_FALLBACK_IMAGE } from '../utils/constants'

interface Props extends ImageComponentProps {
  showRetry?: boolean
  preload?: boolean
}

interface Emits {
  load: [event: Event]
  error: [error: Error]
  click: [event: MouseEvent]
  retry: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  fallback: DEFAULT_FALLBACK_IMAGE,
  showRetry: true,
  preload: false
})

const emit = defineEmits<Emits>()

// 使用圖片載入器
const { state, currentSrc, error, load, retry } = useImageLoader({
  maxRetries: 3,
  retryDelay: 1000
})

// 計算樣式類別
const containerClass = computed(() => [
  `image-component--${state.value}`,
  props.className
])

const imageClass = computed(() => [
  'image-component__img',
  {
    'image-component__img--loading': state.value === 'loading',
    'image-component__img--loaded': state.value === 'loaded',
    'image-component__img--error': state.value === 'error'
  }
])

// 事件處理
const handleLoad = (event: Event) => {
  emit('load', event)
}

const handleError = () => {
  if (error.value) {
    emit('error', error.value)
  }
}

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const handleRetry = () => {
  emit('retry')
  retry()
}

// 監聽 src 變化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    load(newSrc)
  }
}, { immediate: true })

// 預載入支援
onMounted(() => {
  if (props.preload && props.src) {
    load(props.src)
  }
})
</script>

<style scoped>
.image-component {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.image-component__img {
  max-width: 100%;
  height: auto;
  display: block;
  transition: opacity 0.3s ease;
}

.image-component__img--loading {
  opacity: 0.7;
}

.image-component__img--loaded {
  opacity: 1;
}

.image-component__img--error {
  opacity: 0.3;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
}

.image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  border: 1px solid #fecaca;
}

.error-icon {
  font-size: 24px;
}

.error-text {
  font-size: 14px;
  color: #dc2626;
  text-align: center;
}

.retry-button {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

.retry-button:active {
  background: #1d4ed8;
}

.fallback-image {
  opacity: 0.6;
  filter: grayscale(100%);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .image-loading,
  .image-error {
    padding: 12px;
  }
  
  .loading-text,
  .error-text {
    font-size: 12px;
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
  }
}
</style>