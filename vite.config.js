import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import injectCSS from "vite-plugin-css-injected-by-js"
import mwLoaderPlugin from './plugins/mw-loader-plugin'

export default defineConfig(({mode}) => ({
  plugins: [
    vue(),
    injectCSS(),
    mode === 'development' ? null : mwLoaderPlugin()  // 仅在生产构建时使用 mwLoaderPlugin
  ].filter(Boolean),
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    minify: mode === 'production' ? 'esbuild' : false,
    emptyOutDir: false,
    lib: {
      entry: './index.ts',
      name: 'navlevel',
      formats: ['iife'],
      fileName: (_format) => `navlevel.iife.min.js`
    },
    rollupOptions: {
      external: ['vue', '@wikimedia/codex', 'jquery'],
      output: {
        globals: {
          'vue': 'Vue',
          '@wikimedia/codex': 'Codex',
          'jquery': '$'
        }
      }
    },
    outDir: 'dist'
  }
}))