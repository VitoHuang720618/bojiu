<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { ImageProps } from '../types'

const props = withDefaults(defineProps<ImageProps>(), {
  lazy: true,
  fallback: ''
})

const imgRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)
const getFullUrl = (src: string) => {
  if (!src) return ''
  if (src.startsWith('http')) return src
  // Prepend backend URL for relative paths
  return `http://localhost:3003${src}`
}

const currentSrc = ref(getFullUrl(props.src))
const isIntersecting = ref(false)

watch(() => props.src, (newSrc: string) => {
  currentSrc.value = getFullUrl(newSrc)
  isLoaded.value = false
  hasError.value = false
})

let observer: IntersectionObserver | null = null

const handleLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const handleError = () => {
  hasError.value = true
  if (props.fallback && currentSrc.value !== props.fallback) {
    currentSrc.value = props.fallback
  } else {
    // console.error(`Failed to load image: ${currentSrc.value}`)
  }
}

onMounted(() => {
  if (props.lazy && imgRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isIntersecting.value = true
            if (observer && imgRef.value) {
              observer.unobserve(imgRef.value)
            }
          }
        })
      },
      { rootMargin: '50px', threshold: 0.01 }
    )
    observer.observe(imgRef.value)
  } else {
    isIntersecting.value = true
  }
})

onUnmounted(() => {
  if (observer && imgRef.value) {
    observer.unobserve(imgRef.value)
    observer.disconnect()
  }
})
</script>

<template>
  <img v-if="currentSrc" ref="imgRef" :src="isIntersecting || !lazy ? currentSrc : ''" :alt="alt" :width="width"
    :height="height" :class="{ 'is-loaded': isLoaded, 'has-error': hasError }" @load="handleLoad"
    @error="handleError" />
  <div v-else class="image-placeholder">
    <span>無圖片</span>
  </div>
</template>

<style scoped>
img {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease-in-out;
}

img:not(.is-loaded) {
  opacity: 0;
}

img.is-loaded {
  opacity: 1;
}

img.has-error {
  opacity: 0.5;
  filter: grayscale(100%);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #232323;
  color: #666;
  border: 1px dashed #444;
  width: 100%;
  aspect-ratio: 16/9;
}
</style>