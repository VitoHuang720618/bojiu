<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'
import { useSiteData } from '../composables/useSiteData'

// Use logo and custom CSS from composable
const { effectiveLogo, effectiveHeaderCss, effectiveHeaderBackgroundRgba } = useSiteData()
</script>

<template>
  <style v-if="effectiveHeaderCss" v-html="effectiveHeaderCss"></style>
  <header id="header" :style="{ background: effectiveHeaderBackgroundRgba }">
    <div class="header__logo">
      <ImageComponent :src="effectiveLogo" alt="博九娱乐网" :lazy="false" />
    </div>
  </header>
</template>

<style scoped>
@import "/src/assets/styles/components/HeaderComponent.css";
</style>
