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
  align-items: flex-start;
  background: linear-gradient(0deg, #8b0012 0%, #ba081f 100%), #000000;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.30);
  display: flex;
  height: 75px;
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
  width: 304px;
  height: 84px;
}

@media (max-width: 1024px) {
  .header__logo {
    height: 56px;
  }
}

.header__logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
