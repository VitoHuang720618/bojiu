<script setup lang="ts">
import { siteConfig } from '../config/siteConfig'
</script>

<template>
  <footer id="footer">
    <span>{{ siteConfig.footer.copyright }}</span>
  </footer>
</template>

<style scoped>
#footer {
  align-items: center;
  background: linear-gradient(0deg, #232323, #000) #000;
  display: flex;
  height: 56px;
  justify-content: center;
  width: 100%;
  color: #fff;
  font-size: 14px;
}
</style>
