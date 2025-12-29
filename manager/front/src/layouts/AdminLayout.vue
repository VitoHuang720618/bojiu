<script setup lang="ts">
import SidebarComponent from '../components/SidebarComponent.vue'
import HeaderComponent from '../components/HeaderComponent.vue'
import FooterComponent from '../components/FooterComponent.vue'
</script>

<template>
  <div class="admin-layout">
    <SidebarComponent />
    
    <div class="content-wrapper">
      <HeaderComponent />
      <main id="main">
        <router-view />
      </main>
      <FooterComponent />
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-background);
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

#main {
  flex: 1;
  padding: var(--spacing-lg);
}
</style>
