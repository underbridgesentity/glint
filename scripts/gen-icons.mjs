// Generates Glint brand app icons/splash (Carbon Black + Electric Lemon dot).
// Run: node scripts/gen-icons.mjs
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const CARBON = [12, 12, 12, 255];
const LEMON = [205, 255, 0, 255];

// Draw a square with optional bg + a centered filled circle.
function make(size, { bg, dotR, dotColor = LEMON }) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      const inDot = dotR > 0 && (x - cx) ** 2 + (y - cy) ** 2 <= dotR ** 2;
      const px = inDot ? dotColor : bg;
      png.data[i] = px[0]; png.data[i + 1] = px[1]; png.data[i + 2] = px[2]; png.data[i + 3] = px[3];
    }
  }
  return PNG.sync.write(png);
}

const TRANSPARENT = [0, 0, 0, 0];

for (const app of ['customer', 'technician']) {
  const dir = `apps/${app}/assets`;
  mkdirSync(dir, { recursive: true });
  // Square icon: carbon field, lemon dot (~34% diameter)
  writeFileSync(`${dir}/icon.png`, make(1024, { bg: CARBON, dotR: 175 }));
  // Android adaptive foreground: transparent, smaller dot inside the safe zone
  writeFileSync(`${dir}/adaptive-icon.png`, make(1024, { bg: TRANSPARENT, dotR: 150 }));
  // Splash: carbon field, lemon dot
  writeFileSync(`${dir}/splash.png`, make(1024, { bg: CARBON, dotR: 120 }));
  // Web favicon
  writeFileSync(`${dir}/favicon.png`, make(48, { bg: CARBON, dotR: 9 }));
  console.log(`✓ ${app} icons written to ${dir}`);
}
