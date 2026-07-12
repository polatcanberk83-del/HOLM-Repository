import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // If deploying to https://username.github.io/holm-site  →  base: '/holm-site/'
  // If deploying to a custom domain (e.g. holm.studio)    →  base: '/'
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        philosophy: resolve(__dirname, 'philosophy/index.html'),
        about:      resolve(__dirname, 'about/index.html'),
        contact:    resolve(__dirname, 'contact/index.html'),
      },
    },
  },
})
