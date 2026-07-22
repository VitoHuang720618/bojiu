<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarComponent from '../components/SidebarComponent.vue'
import HeaderComponent from '../components/HeaderComponent.vue'
import FooterComponent from '../components/FooterComponent.vue'

const route = useRoute()
const isConfigWorkspace = computed(() => route.name === 'config')
</script>

<template>
  <div class="admin-layout">
    <SidebarComponent v-if="!isConfigWorkspace" />
    
    <div class="content-wrapper" :class="{ workspace: isConfigWorkspace }">
      <HeaderComponent v-if="!isConfigWorkspace" />
      <main id="main" :class="{ workspace: isConfigWorkspace }">
        <router-view />
      </main>
      <FooterComponent v-if="!isConfigWorkspace" />
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

.content-wrapper.workspace {
  overflow: hidden;
}

#main.workspace {
  padding: 0;
  min-height: 0;
  overflow: hidden;
}
</style>
