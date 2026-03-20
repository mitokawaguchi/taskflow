import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
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
            if (id.includes('react') || id.includes('react-dom')) return 'vendor'
          }
        },
      },
    },
  },
})
