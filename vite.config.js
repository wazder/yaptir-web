import { defineConfig } from 'vite'

export default defineConfig({
  base: '/okeep-web-1/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
