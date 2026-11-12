// The SVG is the source of truth; regenerate raster fallbacks after editing it.
// Run from frontend: node scripts/generate-brand-icons.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

async function main() {
  const app = fileURLToPath(new URL('../src/app/', import.meta.url));
  const svg = await fs.readFile(path.join(app, 'icon.svg'));
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await fs.writeFile(path.join(app, 'favicon.ico'), Buffer.concat([header, ...images]));
  await sharp(svg, { density: 384 }).resize(180, 180).png().toFile(path.join(app, 'apple-icon.png'));
  console.log('Generated 16/32/48px favicon and 180px Apple icon from icon.svg');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
