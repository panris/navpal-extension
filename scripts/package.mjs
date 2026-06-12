#!/usr/bin/env node
/**
 * Post-build: create installation zip in dist/ and releases/
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releasesDir = path.join(rootDir, 'releases');

// Read version
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;
const zipName = `navpal-extension-v${version}.zip`;

// Ensure releases/ exists
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

const distZipPath = path.join(distDir, zipName);
const releasesZipPath = path.join(releasesDir, zipName);

// Remove old
if (fs.existsSync(distZipPath)) fs.unlinkSync(distZipPath);
if (fs.existsSync(releasesZipPath)) fs.unlinkSync(releasesZipPath);

// Zip from inside dist/ so archive has no prefix
process.chdir(distDir);
execSync(`zip -r "${zipName}" . --symlinks`, { stdio: 'inherit' });
console.log(`✓ Created ${zipName} in dist/`);

// Copy to releases/
fs.copyFileSync(distZipPath, releasesZipPath);
console.log(`✓ Copied to releases/${zipName}`);
