// 生成扩展图标
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

const sizes = [16, 48, 128];
const iconsDir = join(rootDir, 'dist', 'icons');

// 简单的SVG图标内容
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="80" fill="white" opacity="0.9"/>
  <path d="M256 180 L256 332 M180 256 L332 256" stroke="white" stroke-width="24" stroke-linecap="round"/>
</svg>`;

async function generateIcons() {
  mkdirSync(iconsDir, { recursive: true });

  const svgBuffer = Buffer.from(svgIcon);

  for (const size of sizes) {
    const pngPath = join(iconsDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✓ Generated icon${size}.png`);
  }

  // 512尺寸（用于Chrome Web Store）
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon512.png'));
  console.log('✓ Generated icon512.png');

  console.log('\n图标生成完成！');
}

generateIcons().catch(console.error);
