<script setup lang="ts">
import { siteConfig } from '../config/siteConfig'
</script>

<template>
  <footer id="footer">
    <div class="footer__content">
      <p class="copyright">{{ siteConfig.footer.copyright }}</p>
    </div>
  </footer>
</template>

<style scoped>
#footer {
  background: linear-gradient(0deg, #232323, #000);
  border-top: 2px solid #dfb082;
  padding: 1rem 2rem;
  text-align: center;
}

.footer__content {
  margin: 0 auto;
  max-width: 1600px;
}

.copyright {
  color: #ffd08c;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  #footer {
    padding: 0.75rem 1rem;
  }
  
  .copyright {
    font-size: 0.75rem;
  }
}
</style>