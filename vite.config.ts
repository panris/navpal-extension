import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite plugin: fix HTML for Chrome extension compatibility
function fixChromeExtensionHtml() {
  return {
    name: 'fix-chrome-extension-html',
    transformIndexHtml(html: string) {
      return html
        // MV3 CSP disallows crossorigin on module scripts
        .replace(/\s+crossorigin(?:="[^"]*")?/g, '')
        // modulepreload links are unnecessary for Chrome extensions
        .replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/g, '');
    },
  };
}

export default defineConfig({
  plugins: [react(), fixChromeExtensionHtml()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false, // Combine all CSS into one file for Chrome extensions
    modulePreload: false, // Chrome extension doesn't need Vite's modulepreload polyfill
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
