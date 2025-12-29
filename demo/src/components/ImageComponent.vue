<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ImageProps } from '../types'

const props = withDefaults(defineProps<ImageProps>(), {
  lazy: true,
  fallback: ''
})

const imgRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)
const currentSrc = ref(props.src)
const isIntersecting = ref(false)

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
    console.error(`Failed to load image: ${currentSrc.value}`)
  }
}

onMounted(() => {
  if (props.lazy && imgRef.value) {
    // Set up Intersection Observer for lazy loading
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
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )
    
    observer.observe(imgRef.value)
  } else {
    // Load immediately if not lazy
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
  <img
    ref="imgRef"
    :src="isIntersecting || !lazy ? currentSrc : ''"
    :alt="alt"
    :width="width"
    :height="height"
    :class="{ 'is-loaded': isLoaded, 'has-error': hasError }"
    @load="handleLoad"
    @error="handleError"
  />
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
</style>
