import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'unknown'
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/\.(css)$/i.test(name)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Optimize for production
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  },
  // Configure base path for /admin/ deployment in container
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  // Define environment variables for container deployment
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
    __CDN_BASE_URL__: JSON.stringify(process.env.VITE_CDN_BASE_URL || '/uploads')
  }
})