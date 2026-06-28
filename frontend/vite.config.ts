import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/framer-motion/')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/react-markdown/') || id.includes('node_modules/remark-gfm/') || id.includes('node_modules/rehype-sanitize/') || id.includes('node_modules/micromark') || id.includes('node_modules/mdast') || id.includes('node_modules/unist')) {
            return 'markdown-vendor';
          }
          if (id.includes('node_modules/react-hook-form/') || id.includes('node_modules/@hookform/resolvers/') || id.includes('node_modules/zod/')) {
            return 'form-vendor';
          }
          if (id.includes('node_modules/zustand/')) {
            return 'state-vendor';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
