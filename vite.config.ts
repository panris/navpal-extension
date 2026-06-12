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

// Vite plugin: inline all assets into HTML after build (Chrome extension fix)
function inlineAssets() {
  return {
    name: 'inline-assets',
    async closeBundle() {
      const fs = await import('fs/promises');
      const path_ = await import('path');
      const distDir = path_.resolve(__dirname, 'dist');

      // Find all HTML files in dist
      const files = await fs.readdir(distDir, { withFileTypes: true });
      for (const dirent of files) {
        if (dirent.isFile() && dirent.name.endsWith('.html')) {
          await inlineHtml(path_.join(distDir, dirent.name), distDir, fs, path_);
        } else if (dirent.isDirectory()) {
          await processDir(path_.join(distDir, dirent.name), distDir, fs, path_);
        }
      }
    },
  };
}

async function processDir(dir: string, distDir: string, fs: any, path_: any) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path_.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(full, distDir, fs, path_);
    } else if (entry.name.endsWith('.html')) {
      await inlineHtml(full, distDir, fs, path_);
    }
  }
}

async function inlineHtml(htmlPath: string, distDir: string, fs: any, path_: any) {
  let html = await fs.readFile(htmlPath, 'utf8');
  const htmlDir = path_.dirname(htmlPath);

  // Collect all inline candidates
  const cssMatches = [...html.matchAll(/<link([^>]*)rel="stylesheet"([^>]*)>/gi)];
  const jsMatches = [...html.matchAll(/<script([^>]*)src="([^"]+)"([^>]*)>[\s\S]*?<\/script>/gi)];
  const preloadMatches = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*>/gi)];

  let modified = false;

  // Process CSS
  for (const m of cssMatches) {
    const full = m[0];
    const hrefMatch = full.match(/href="([^"]+)"/);
    if (!hrefMatch) continue;
    const cssPath = path_.resolve(htmlDir, hrefMatch[1]);
    try {
      const css = await fs.readFile(cssPath, 'utf8');
      html = html.replace(full, `<style>${css}</style>`);
      modified = true;
    } catch {}
  }

  // Process JS
  for (const m of jsMatches) {
    const full = m[0];
    const src = m[2];
    const jsPath = path_.resolve(htmlDir, src);
    try {
      const js = await fs.readFile(jsPath, 'utf8');
      html = html.replace(full, `<script type="module">${js}</script>`);
      modified = true;
    } catch {}
  }

  // Remove modulepreload
  for (const m of preloadMatches) {
    html = html.replace(m[0], '');
    modified = true;
  }

  if (modified) {
    await fs.writeFile(htmlPath, html, 'utf8');
  }
}

export default defineConfig({
  plugins: [react(), removeCrossorigin(), inlineAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
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
          // 将所有 node_modules 代码打包到单个 vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  base: './', // Use relative paths
})