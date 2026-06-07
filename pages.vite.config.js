import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import injectCSS from "vite-plugin-css-injected-by-js"

export default defineConfig(({mode}) => ({
  plugins: [
    vue(),
    injectCSS()
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    '__NO_MW__': 'true',
    'HOST': "'https://rs.miraheze.org'"
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
    emptyOutDir: true,
    outDir: 'dist-pages'
  }
}))