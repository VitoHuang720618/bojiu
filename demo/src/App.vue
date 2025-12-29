<script setup lang="ts">
import HeaderComponent from './components/HeaderComponent.vue'
import HomePage from './components/HomePage.vue'
import FooterComponent from './components/FooterComponent.vue'
</script>

<template>
  <div id="wrapper">
    <HeaderComponent />
    <main id="main">
      <HomePage />
    </main>
    <FooterComponent />
  </div>
</template>

<style>
#wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main {
  flex: 1;
}
</style>
