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
  background: #3e080f;
  display: flex;
  height: 44px;
  justify-content: center;
  width: 100%;
  color: #fff;
  font-size: 12px;
}

@media (max-width: 1279px) {
  #footer {
    height: 44px;
    background: #3e080f !important;
    border-top: 2px solid #dfb082 !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #footer span {
    width: auto;
    height: auto;
    font-size: 12px;
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
