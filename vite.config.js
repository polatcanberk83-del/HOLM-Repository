import { defineConfig } from 'vite'

export default defineConfig({
  // If deploying to https://username.github.io/holm-site  →  base: '/holm-site/'
  // If deploying to a custom domain (e.g. holm.studio)    →  base: '/'
  base: process.env.VITE_BASE_PATH || '/',
})
