// Run on the VPS after sourcing /etc/aylamusk.env. Never prints credentials.
const { PrismaClient } = require('@prisma/client');
const { createHash } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { uploadToCloudinary, getCloudinaryConfig } = require('../dist/lib/cloudinary');

const prisma = new PrismaClient();
async function main() {
  getCloudinaryConfig();
  const origin = new URL(process.env.PUBLIC_ORIGIN).origin;
  const products = await prisma.product.findMany();
  const categories = await prisma.category.findMany();
  const owned = url => { try { const u = new URL(url, origin); return u.origin === origin && u.pathname.startsWith('/api/uploads/'); } catch { return false; } };
  const pending = [...new Set([...products.flatMap(p => JSON.parse(p.imagesJson)), ...categories.map(c => c.image)].filter(owned))];
  console.log(JSON.stringify({ products: products.length, categories: categories.length, imagesToMigrate: pending.length, apply: process.argv.includes('--apply') }));
  if (!process.argv.includes('--apply')) return;
  const backupDir = path.resolve(__dirname, '../catalog/backups');
  await fs.mkdir(backupDir, { recursive: true, mode: 0o700 });
  const backupPath = path.join(backupDir, `image-urls-${Date.now()}.json`);
  await fs.writeFile(backupPath, JSON.stringify({ products: products.map(p => ({ id: p.id, slug: p.slug, imagesJson: p.imagesJson })), categories: categories.map(c => ({ slug: c.slug, image: c.image })) }, null, 2), { mode: 0o600 });
  console.log(`Original image URLs backed up: ${backupPath}`);
  const migrated = new Map();
  async function migrate(url) {
    if (!owned(url)) return url;
    if (migrated.has(url)) return migrated.get(url);
    const original = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!original.ok || !original.headers.get('content-type')?.startsWith('image/')) throw new Error('Cannot read original image');
    const bytes = Buffer.from(await original.arrayBuffer());
    const key = 'catalog-' + createHash('sha256').update(url).digest('hex').slice(0, 24);
    const cloudUrl = await uploadToCloudinary(bytes, original.headers.get('content-type'), `${key}.webp`, key);
    const delivered = await fetch(cloudUrl, { signal: AbortSignal.timeout(30000) });
    if (!delivered.ok || !delivered.headers.get('content-type')?.startsWith('image/')) throw new Error('Cloudinary CDN verification failed');
    await delivered.arrayBuffer();
    migrated.set(url, cloudUrl);
    return cloudUrl;
  }
  for (const product of products) {
    const before = JSON.parse(product.imagesJson);
    const after = [];
    for (const image of before) after.push(await migrate(image));
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      await prisma.product.update({ where: { id: product.id }, data: { imagesJson: JSON.stringify(after) } });
      console.log(`Migrated product: ${product.slug}`);
    }
  }
  for (const category of categories) {
    const after = await migrate(category.image);
    if (after !== category.image) {
      await prisma.category.update({ where: { slug: category.slug }, data: { image: after } });
      console.log(`Migrated category: ${category.slug}`);
    }
  }
  const report = { completedAt: new Date().toISOString(), migratedImages: Object.fromEntries(migrated), backupPath };
  await fs.writeFile(path.resolve(__dirname, '../catalog/cloudinary-migration.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log(`Migration complete: ${migrated.size} images on Cloudinary. Product data and stock preserved.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
