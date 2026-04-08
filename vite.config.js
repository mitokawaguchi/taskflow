import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** GitHub Pages 等: 404 応答でも index と同じ SPA を配信し、/today 等でリロード可能にする */
function spaFallback404Html() {
  return {
    name: 'spa-fallback-404-html',
    closeBundle() {
      const indexHtml = path.resolve(__dirname, 'dist/index.html')
      const notFoundHtml = path.resolve(__dirname, 'dist/404.html')
      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, notFoundHtml)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback404Html()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@dnd-kit')) return 'dnd-kit'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('tldraw')) return 'tldraw'
            if (id.includes('react') || id.includes('react-dom')) return 'vendor'
          }
        },
      },
    },
  },
})
