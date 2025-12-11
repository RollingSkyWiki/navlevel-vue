import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: '.',
  base: './',
  server: {
    port: 3001,
    open: '/demo.html',
    host: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  preview: {
    port: 4174,
    host: true,
    open: '/demo.html'
  },
  resolve: {
    alias: {
      '@': '.',
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  optimizeDeps: {
    exclude: ['ext.gadget.HanAssist'],
    entries: ['demo.html']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@wikimedia/codex-design-tokens/theme-wikimedia-ui";`
      }
    }
  }
})