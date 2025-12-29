<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'
import { assetManifest } from '../config/assetManifest'
</script>

<template>
  <header id="header">
    <div class="header__logo">
      <ImageComponent
        :src="assetManifest.logo"
        alt="博九娱乐网"
        :lazy="false"
      />
    </div>
  </header>
</template>

<style scoped>
#header {
  align-items: flex-start;
  background: linear-gradient(0deg, #ba081f, #8b0012) #000;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  height: 60px;
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
  height: 86px;
}

@media (max-width: 1024px) {
  .header__logo {
    height: 56px;
  }
}

.header__logo img {
  display: block;
  height: 100%;
  width: auto;
}
</style>
