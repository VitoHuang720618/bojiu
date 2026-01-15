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

@media (max-width: 1279px) {
  #footer {
    height: 48px;
    background: #1a0305 !important;
    border-top: 1px solid #dfb082 !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #footer span {
    width: 232px;
    height: 16px;
    font-size: 14px;
    font-family: "Microsoft YaHei UI", "Microsoft YaHei UI-Light", sans-serif;
    font-weight: 300;
    text-align: left;
    color: #fefefe;
    letter-spacing: 0.69px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
}
</style>
