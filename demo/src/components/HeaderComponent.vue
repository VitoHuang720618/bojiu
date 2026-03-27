<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import ImageComponent from './ImageComponent.vue'
import { useSiteData } from '../composables/useSiteData'

// Use logo and custom CSS from composable
const { effectiveLogo, effectiveHeaderCss, effectiveHeaderBackgroundRgba } = useSiteData()

// Handle dynamic CSS injection
const dynamicStyleTag = ref<HTMLStyleElement | null>(null)

const updateDynamicStyle = (css: string) => {
  if (!css) {
    if (dynamicStyleTag.value) {
      dynamicStyleTag.value.innerHTML = ''
    }
    return
  }

  if (!dynamicStyleTag.value) {
    dynamicStyleTag.value = document.createElement('style')
    dynamicStyleTag.value.setAttribute('data-dynamic-header', '')
    document.head.appendChild(dynamicStyleTag.value)
  }
  dynamicStyleTag.value.innerHTML = css
}

onMounted(() => {
  if (effectiveHeaderCss.value) {
    updateDynamicStyle(effectiveHeaderCss.value)
  }
})

watch(() => effectiveHeaderCss.value, (newCss) => {
  updateDynamicStyle(newCss || '')
})

onUnmounted(() => {
  if (dynamicStyleTag.value) {
    document.head.removeChild(dynamicStyleTag.value)
    dynamicStyleTag.value = null
  }
})
</script>

<template>
  <header id="header" :style="{ background: effectiveHeaderBackgroundRgba }">
    <div class="header__logo">
      <ImageComponent :src="effectiveLogo" alt="博九娛樂網" :lazy="false" />
    </div>
  </header>
</template>

<style scoped>
@import "/src/assets/styles/components/HeaderComponent.css";
</style>
