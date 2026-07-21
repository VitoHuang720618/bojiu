<script setup lang="ts">
import { useSiteData } from '../composables/useSiteData'

const { effectiveSectionColors } = useSiteData()
</script>

<template>
  <footer id="footer" :style="{ '--footer-background': effectiveSectionColors.footerBackground }">
    <span>Copyright © 博九娱乐网 Reserved</span>
  </footer>
</template>

<style scoped>
@import "/src/assets/styles/components/FooterComponent.css";
</style>
