/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env

// https://vite.dev/config/
export default defineConfig({
  base: env?.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setupTests.ts'],
  },
})
