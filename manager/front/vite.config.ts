import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  //const base = isProd ? '/b9-site/admin/' : '/'
  const base = isProd ? '/admin/' : '/'
  //const apiBase = isProd ? '/b9-site/api' : '/api'
  const apiBase = isProd ? '/api' : '/api'

  return {
    plugins: [vue()],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://localhost:3002',
          changeOrigin: true
        }
      }
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
    // Configure base path
    base: base,
    // Define environment variables
    define: {
      __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || apiBase),
      __CDN_BASE_URL__: JSON.stringify(process.env.VITE_CDN_BASE_URL || (isProd ? '/uploads' : '/uploads'))
    }
  }
})