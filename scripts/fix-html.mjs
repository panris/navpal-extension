#!/usr/bin/env node
/**
 * Post-build: remove crossorigin attributes from HTML files
 * Chrome extension module scripts must NOT have crossorigin.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!f.endsWith('.html')) continue;
    let html = fs.readFileSync(full, 'utf8');
    html = html.replace(/\s+crossorigin(?:="[^"]*")?/g, '');
    fs.writeFileSync(full, html, 'utf8');
    console.log(`✓ Fixed ${path.relative(distDir, full)}`);
  }
}
walk(distDir);
console.log('crossorigin attributes removed.');
