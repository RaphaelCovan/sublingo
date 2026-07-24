import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.config.ts' // Change path and extension

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
})