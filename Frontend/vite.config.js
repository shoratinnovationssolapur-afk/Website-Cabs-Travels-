import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // This ensures all asset paths start with / and not relative ./
  base: '/', 
  build: {
    // This ensures your JS/CSS goes into an 'assets' folder
    assetsDir: 'assets',
    // This helps prevent the "ChunkLoadError" by keeping filenames predictable
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})