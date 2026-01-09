<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'
import { assetManifest } from '../config/assetManifest'
</script>

<template>
  <header id="header">
    <div class="header__logo">
      <ImageComponent :src="assetManifest.logo" alt="博九娱乐网" :lazy="false" />
    </div>
  </header>
</template>

<style scoped>
#header {
  align-items: center; /* 改為置中對齊 */
  background: linear-gradient(0deg, #8b0012 0%, #ba081f 100%), #000000;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.30);
  display: flex;
  height: 60px; /* 調整高度以配合 50px logo */
  justify-content: center;
  position: relative;
  width: 100%;
  z-index: 98;
}

@media (max-width: 1024px) {
  #header {
    height: 40px;
  }
}

.header__logo {
  width: 180px;
  height: 50px;
}

@media (max-width: 1024px) {
  .header__logo {
    width: 140px; /* 小螢幕自動縮小 */
    height: 40px;
  }
}

.header__logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
