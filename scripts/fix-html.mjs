#!/usr/bin/env node
/**
 * Post-build: Chrome extension compatibility fixes
 * 1. Remove crossorigin attributes (MV3 CSP)
 * 2. Remove Vite modulepreload polyfill from ErrorBoundary.js chunk
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

// --- Part 1: HTML fixes ---
function walkHtml(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { walkHtml(full); continue; }
    if (!f.endsWith('.html')) continue;
    let html = fs.readFileSync(full, 'utf8');
    const before = html.length;
    html = html
      .replace(/\s+crossorigin(?:="[^"]*")?/g, '')
      .replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/g, '');
    if (html.length !== before) {
      fs.writeFileSync(full, html, 'utf8');
      console.log(`  ✓ HTML cleaned: ${path.relative(distDir, full)}`);
    }
  }
}

// --- Part 2: Remove modulepreload polyfill from ErrorBoundary.js ---
function removeModulepreloadPolyfill() {
  const chunkPath = path.join(distDir, 'assets', 'ErrorBoundary.js');
  if (!fs.existsSync(chunkPath)) return;

  let code = fs.readFileSync(chunkPath, 'utf8');
  const beforeLen = code.length;

  const dtStart = code.indexOf('Dt=function(){const n=typeof document');
  const mnStart = code.indexOf('Le={},Mn=function');
  if (dtStart === -1 || mnStart === -1) {
    // Already removed or pattern changed
    if (code.includes('modulepreload')) {
      console.log('  ⚠ modulepreload still present, check pattern');
    } else {
      console.log('  ✓ ErrorBoundary.js already clean');
    }
    return;
  }

  // Find balanced closing brace of the Mn=function
  const bracePos = code.indexOf('{', mnStart + 5);
  let depth = 0, endPos = -1;
  for (let i = bracePos; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (depth === 0) { endPos = i + 1; break; } }
  }
  if (endPos === -1) {
    console.log('  ⚠ Could not find end of Mn=function');
    return;
  }

  code = code.substring(0, dtStart) + code.substring(endPos);
  const saved = beforeLen - code.length;
  fs.writeFileSync(chunkPath, code, 'utf8');
  console.log(`  ✓ Removed modulepreload polyfill: ${saved.toLocaleString()} bytes saved`);
}

// --- Run ---
console.log('[fix-html] Chrome extension compatibility fixes...');
walkHtml(distDir);
removeModulepreloadPolyfill();
console.log('[fix-html] Done.');
