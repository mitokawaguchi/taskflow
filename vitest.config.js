import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      exclude: ['node_modules/', 'vitest.setup.js', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    },
  },
})
