import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site from https://<user>.github.io/<repo>/,
  // so the build needs to know that prefix. The deploy workflow sets
  // VITE_BASE=/<repo>/; locally it stays '/' and nothing changes.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // exposes the dev server on the LAN so you can test on a real phone
  },
})
