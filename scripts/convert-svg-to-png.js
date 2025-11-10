/**
 * Convert SVG to PNG for WhatsApp/Open Graph compatibility
 * This script converts public/og-image.svg to public/og-image.png
 * 
 * Requirements: Install sharp first - npm install --save-dev sharp
 * Run: node scripts/convert-svg-to-png.js
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public', 'og-image.svg');
const pngPath = join(projectRoot, 'public', 'og-image.png');

try {
  console.log('Reading SVG file...');
  const svgBuffer = readFileSync(svgPath);
  
  console.log('Converting SVG to PNG (1200x630)...');
  const pngBuffer = await sharp(svgBuffer)
    .resize(1200, 630, {
      fit: 'fill',
      background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 background
    })
    .png()
    .toBuffer();
  
  writeFileSync(pngPath, pngBuffer);
  console.log(`✅ Successfully created ${pngPath}`);
  console.log('PNG image is ready for WhatsApp sharing!');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
    console.error('❌ Error: sharp module not found.');
    console.log('\n📦 Please install sharp first:');
    console.log('   npm install --save-dev sharp');
    console.log('\nThen run this script again.');
  } else {
    console.error('❌ Error converting SVG to PNG:', error.message);
    process.exit(1);
  }
}

