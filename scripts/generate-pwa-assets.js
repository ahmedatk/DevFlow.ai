/**
 * Generate comprehensive PWA assets for cross-platform support
 * Creates icons and splash screens for light and dark themes
 * 
 * Requirements: sharp (already in devDependencies)
 * Run: npm run generate-pwa-assets
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public', 'favicon.svg');
const iconsLightDir = join(projectRoot, 'public', 'icons', 'light');
const iconsDarkDir = join(projectRoot, 'public', 'icons', 'dark');
const splashLightDir = join(projectRoot, 'public', 'splash', 'light');
const splashDarkDir = join(projectRoot, 'public', 'splash', 'dark');

// Color schemes
const lightTheme = {
  background: { r: 255, g: 255, b: 255, alpha: 1 }, // White
  iconColor: { r: 59, g: 130, b: 246, alpha: 1 } // Blue #3b82f6
};

const darkTheme = {
  background: { r: 18, g: 18, b: 18, alpha: 1 }, // #121212
  iconColor: { r: 59, g: 130, b: 246, alpha: 1 } // Blue #3b82f6
};

// Icon sizes for PWA
const iconSizes = [
  { size: 16, name: 'favicon-16x16' },
  { size: 32, name: 'favicon-32x32' },
  { size: 48, name: 'icon-48x48' },
  { size: 72, name: 'icon-72x72' },
  { size: 96, name: 'icon-96x96' },
  { size: 128, name: 'icon-128x128' },
  { size: 144, name: 'icon-144x144' },
  { size: 152, name: 'apple-touch-icon-152x152' },
  { size: 167, name: 'apple-touch-icon-167x167' },
  { size: 180, name: 'apple-touch-icon-180x180' },
  { size: 192, name: 'icon-192x192' },
  { size: 384, name: 'icon-384x384' },
  { size: 512, name: 'icon-512x512' },
  { size: 1024, name: 'icon-1024x1024' }
];

// iOS Splash screen sizes
const splashSizes = [
  { width: 640, height: 1136, name: 'iphone-se' }, // iPhone SE
  { width: 750, height: 1334, name: 'iphone-8' }, // iPhone 8
  { width: 828, height: 1792, name: 'iphone-xr' }, // iPhone XR
  { width: 1125, height: 2436, name: 'iphone-xs' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'iphone-xs-max' }, // iPhone XS Max
  { width: 1284, height: 2778, name: 'iphone-14-pro-max' }, // iPhone 14 Pro Max
  { width: 1536, height: 2048, name: 'ipad' }, // iPad
  { width: 1668, height: 2388, name: 'ipad-pro-12' }, // iPad Pro 12.9"
  { width: 2048, height: 2732, name: 'ipad-pro-12-landscape' } // iPad Pro 12.9" landscape
];

// Create a themed icon from SVG
async function createThemedIcon(svgBuffer, size, theme, outputPath) {
  // Create a canvas with theme background
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: theme.background
    }
  });

  // Composite the SVG on top
  const svgResized = await sharp(svgBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  await canvas
    .composite([{ input: svgResized, blend: 'over' }])
    .png()
    .toFile(outputPath);
}

// Create maskable icon (with safe zone)
async function createMaskableIcon(svgBuffer, size, theme, outputPath) {
  const safeZone = Math.floor(size * 0.2); // 20% safe zone for maskable icons
  const iconSize = size - (safeZone * 2);

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: theme.background
    }
  });

  const svgResized = await sharp(svgBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  await canvas
    .composite([{ 
      input: svgResized, 
      blend: 'over',
      left: safeZone,
      top: safeZone
    }])
    .png()
    .toFile(outputPath);
}

// Create splash screen
async function createSplashScreen(svgBuffer, width, height, theme, outputPath) {
  const minDimension = Math.min(width, height);
  const iconSize = Math.floor(minDimension * 0.3); // Icon takes 30% of smaller dimension

  const canvas = sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: theme.background
    }
  });

  const svgResized = await sharp(svgBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const left = Math.floor((width - iconSize) / 2);
  const top = Math.floor((height - iconSize) / 2);

  await canvas
    .composite([{ 
      input: svgResized, 
      blend: 'over',
      left: left,
      top: top
    }])
    .png()
    .toFile(outputPath);
}

async function generateAssets() {
  try {
    console.log('🎨 Generating comprehensive PWA assets...\n');

    // Ensure directories exist
    [iconsLightDir, iconsDarkDir, splashLightDir, splashDarkDir].forEach(dir => {
      mkdirSync(dir, { recursive: true });
    });

    console.log('📖 Reading SVG file...');
    const svgBuffer = readFileSync(svgPath);

    // Generate icons for both themes
    console.log('\n📱 Generating icons...');
    for (const { size, name } of iconSizes) {
      // Light theme
      const lightPath = join(iconsLightDir, `${name}.png`);
      await createThemedIcon(svgBuffer, size, lightTheme, lightPath);
      console.log(`  ✅ Light: ${name}.png`);

      // Dark theme
      const darkPath = join(iconsDarkDir, `${name}.png`);
      await createThemedIcon(svgBuffer, size, darkTheme, darkPath);
      console.log(`  ✅ Dark: ${name}.png`);

      // Maskable icons (192 and 512 are most important)
      if (size === 192 || size === 512) {
        const maskableLightPath = join(iconsLightDir, `maskable-${name}.png`);
        await createMaskableIcon(svgBuffer, size, lightTheme, maskableLightPath);
        console.log(`  ✅ Light Maskable: maskable-${name}.png`);

        const maskableDarkPath = join(iconsDarkDir, `maskable-${name}.png`);
        await createMaskableIcon(svgBuffer, size, darkTheme, maskableDarkPath);
        console.log(`  ✅ Dark Maskable: maskable-${name}.png`);
      }
    }

    // Generate splash screens
    console.log('\n📺 Generating splash screens...');
    for (const { width, height, name } of splashSizes) {
      // Light theme
      const lightSplashPath = join(splashLightDir, `${name}.png`);
      await createSplashScreen(svgBuffer, width, height, lightTheme, lightSplashPath);
      console.log(`  ✅ Light: ${name}.png (${width}x${height})`);

      // Dark theme
      const darkSplashPath = join(splashDarkDir, `${name}.png`);
      await createSplashScreen(svgBuffer, width, height, darkTheme, darkSplashPath);
      console.log(`  ✅ Dark: ${name}.png (${width}x${height})`);
    }

    // Generate favicon
    console.log('\n🔖 Generating favicon...');
    const faviconPath = join(projectRoot, 'public', 'favicon.ico');
    // Create a multi-size ICO file (16x16, 32x32)
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16, { fit: 'contain', background: lightTheme.background })
      .png()
      .toBuffer();
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32, { fit: 'contain', background: lightTheme.background })
      .png()
      .toBuffer();
    
    // For now, save as PNG (browsers accept PNG as favicon)
    writeFileSync(join(projectRoot, 'public', 'favicon-16x16.png'), favicon16);
    writeFileSync(join(projectRoot, 'public', 'favicon-32x32.png'), favicon32);
    console.log('  ✅ favicon-16x16.png');
    console.log('  ✅ favicon-32x32.png');

    console.log('\n🎉 All PWA assets generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('   - Icons (light): public/icons/light/');
    console.log('   - Icons (dark): public/icons/dark/');
    console.log('   - Splash screens (light): public/splash/light/');
    console.log('   - Splash screens (dark): public/splash/dark/');
    console.log('   - Favicons: public/favicon-*.png');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('❌ Error: sharp module not found.');
      console.log('\n📦 Please install sharp first:');
      console.log('   npm install --save-dev sharp');
    } else if (error.code === 'ENOENT') {
      console.error(`❌ Error: File not found - ${error.path}`);
    } else {
      console.error('❌ Error generating assets:', error.message);
      console.error(error);
    }
    process.exit(1);
  }
}

generateAssets();

