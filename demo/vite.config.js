import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        target: 'es2020',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    test: {
        globals: true,
        environment: 'happy-dom'
    }
});
