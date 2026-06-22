import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite plugin: remove crossorigin attribute from HTML (Chrome extension fix)
function removeCrossorigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html.replace(/\s+crossorigin(?:="[^"]*")?/g, '');
    },
  };
}

export default defineConfig({
  plugins: [react(), removeCrossorigin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false, // Combine all CSS into one file for Chrome extensions
    rollupOptions: {
      input: {
        background: './src/background/index.ts',
        popup: './src/popup/index.html',
        fullpage: './index.html',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@dnd-kit')) return 'dnd-kit';
            if (id.includes('zustand')) return 'zustand';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react')) return 'react';
            return 'vendor';
          }
        },
      },
    },
  },
  base: './',
})
