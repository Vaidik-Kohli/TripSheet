import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('gsap')) return 'animations';
            if (id.includes('html-to-image') || id.includes('lz-string')) return 'utils';
            if (id.includes('react') || id.includes('react-dom') || id.includes('wouter') || id.includes('zustand')) return 'vendor';
            return 'deps';
          }
        }
      }
    }
  }
})
