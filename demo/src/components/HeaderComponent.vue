<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'
import { useSiteData } from '../composables/useSiteData'

const { effectiveLogo, effectiveHeaderStyle } = useSiteData()
</script>

<template>
  <header id="header" :style="effectiveHeaderStyle">
    <div class="header__logo">
      <ImageComponent :src="effectiveLogo" alt="博九娛樂網" :lazy="false" />
    </div>
  </header>
</template>

<style scoped>
@import "/src/assets/styles/components/HeaderComponent.css";
</style>
