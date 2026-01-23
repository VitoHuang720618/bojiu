<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { ImageProps, BannerConfig } from '../types'

const props = withDefaults(defineProps<ImageProps>(), {
  lazy: true,
  fallback: ''
})

const imgRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)
const hasLoggedError = ref(false)
const isIntersecting = ref(false)

const isObjectSrc = computed(() => typeof props.src === 'object' && props.src !== null)

const displaySrc = computed(() => {
  if (isObjectSrc.value) {
    return (props.src as BannerConfig).pc
  }
  return props.src as string
})

const currentSrc = ref(displaySrc.value)

watch(() => props.src, (newSrc) => {
  currentSrc.value = isObjectSrc.value ? (newSrc as BannerConfig).pc : newSrc as string
  isLoaded.value = false
  hasError.value = false
  hasLoggedError.value = false
})

let observer: IntersectionObserver | null = null

const handleLoad = () => {
  isLoaded.value = true
  hasError.value = false
  hasLoggedError.value = false
}

const handleError = () => {
  // 如果還沒進入視窗（src 是空的），有些瀏覽器會觸發 error，這時不應計入錯誤
  if (props.lazy && !isIntersecting.value) return

  hasError.value = true
  if (props.fallback && currentSrc.value !== props.fallback) {
    currentSrc.value = props.fallback
    hasLoggedError.value = false // 重置，允許對 fallback 報錯一次
  } else if (!hasLoggedError.value && currentSrc.value) {
    // 檢查 resolved src 是否只是根路徑（代表沒載入成功或路徑為空）
    const resolvedSrc = imgRef.value?.src || ''
    const isRootUrl = resolvedSrc === window.location.origin + '/'

    if (!isRootUrl) {
      const errorMsg = `Failed to load image: ${resolvedSrc || currentSrc.value}`
      console.error(errorMsg)
      hasLoggedError.value = true
    }
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
  <picture v-if="isObjectSrc">
    <source media="(max-width: 430px)" :srcset="(src as BannerConfig).mobile || (src as BannerConfig).pc">
    <source media="(max-width: 1279px)" :srcset="(src as BannerConfig).tablet || (src as BannerConfig).pc">
    <img ref="imgRef" :src="isIntersecting || !lazy ? (src as BannerConfig).pc : ''" :alt="alt" :width="width"
      :height="height" :class="{ 'is-loaded': isLoaded, 'has-error': hasError }" @load="handleLoad"
      @error="handleError" />
  </picture>
  <img v-else ref="imgRef" :src="isIntersecting || !lazy ? currentSrc : ''" :alt="alt" :width="width" :height="height"
    :class="{ 'is-loaded': isLoaded, 'has-error': hasError }" @load="handleLoad" @error="handleError" />
</template>

<style scoped>
img {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.6s ease-out;
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
