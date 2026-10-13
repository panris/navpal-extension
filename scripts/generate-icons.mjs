// 生成扩展图标（16/48/128 用于 manifest + 512 用于商店列表页）
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

// 输出到 dist/icons/，与 manifest.json 中的路径一致
const iconsDir = join(rootDir, 'dist', 'icons');

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

  // Manifest 所需尺寸（Edge 和 Chrome 均要求 16/48/128 PNG）
  for (const size of [16, 48, 128]) {
    const pngPath = join(iconsDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✓ Generated icon${size}.png`);
  }

  // 512 尺寸用于商店提交页面（Edge Partner Center 和 Chrome Web Store）
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon512.png'));
  console.log('✓ Generated icon512.png');

  console.log('\n图标生成完成！');
}

generateIcons().catch(console.error);