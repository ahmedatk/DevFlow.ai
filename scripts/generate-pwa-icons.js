/**
 * Generate PWA icons from favicon.svg
 * Creates icon-192x192.png and icon-512x512.png in the public folder
 * 
 * Requirements: sharp (already in devDependencies)
 * Run: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public', 'favicon.svg');
const icon192Path = join(projectRoot, 'public', 'icon-192x192.png');
const icon512Path = join(projectRoot, 'public', 'icon-512x512.png');

async function generateIcons() {
  try {
    console.log('📱 Generating PWA icons...');
    console.log('Reading SVG file...');
    const svgBuffer = readFileSync(svgPath);
    
    // Generate 192x192 icon
    console.log('Creating icon-192x192.png...');
    const icon192Buffer = await sharp(svgBuffer)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 background
      })
      .png()
      .toBuffer();
    writeFileSync(icon192Path, icon192Buffer);
    console.log(`✅ Created ${icon192Path}`);
    
    // Generate 512x512 icon
    console.log('Creating icon-512x512.png...');
    const icon512Buffer = await sharp(svgBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 background
      })
      .png()
      .toBuffer();
    writeFileSync(icon512Path, icon512Buffer);
    console.log(`✅ Created ${icon512Path}`);
    
    console.log('\n🎉 PWA icons generated successfully!');
    console.log('Icons are ready for your Progressive Web App.');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('❌ Error: sharp module not found.');
      console.log('\n📦 Please install sharp first:');
      console.log('   npm install --save-dev sharp');
      console.log('\nThen run this script again.');
    } else if (error.code === 'ENOENT') {
      console.error(`❌ Error: File not found - ${error.path}`);
      console.log('Make sure favicon.svg exists in the public folder.');
    } else {
      console.error('❌ Error generating icons:', error.message);
      process.exit(1);
    }
  }
}

generateIcons();

