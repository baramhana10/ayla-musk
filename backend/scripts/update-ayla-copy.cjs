const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.catalog.local'), quiet: true });
const catalogPath = path.resolve(__dirname, '../catalog/ayla-products.json');
const catalog = require(catalogPath);
const copy = require('../catalog/ayla-luxury-copy.json');

async function main() {
  assert.deepEqual(Object.keys(copy).sort(), catalog.products.map(p => p.slug).sort());
  for (const [slug, value] of Object.entries(copy)) {
    assert.deepEqual(Object.keys(value).sort(), ['description', 'shortDescription']);
    for (const text of Object.values(value)) {
      assert.equal(typeof text, 'string');
      assert.match(text, /[\u0600-\u06ff]/u);
      assert.equal(text.includes('\ufffd'), false);
      assert.ok(!/تُظهر الصورة|تظهر الصورة|بانتظار|غير معلنة|ضرورة تأكيد/.test(text), slug);
    }
    assert.ok(value.shortDescription.length <= 180, `${slug}: short description too long`);
    assert.ok(value.description.split(/\s+/u).length >= 40, `${slug}: description too brief`);
  }
  console.log(`Validated ${Object.keys(copy).length} Arabic product descriptions.`);
  if (!process.argv.includes('--apply')) return;
  const origin = process.env.CATALOG_API_URL;
  const email = process.env.CATALOG_ADMIN_EMAIL;
  const password = process.env.CATALOG_ADMIN_PASSWORD;
  if (!origin || !email || !password) throw new Error('Catalog admin access is required.');
  let cookie;
  async function request(endpoint, method = 'GET', body) {
    const response = await fetch(origin + endpoint, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${method} ${endpoint}: HTTP ${response.status}`);
    if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
    return response.json();
  }
  const login = await request('/api/auth/login', 'POST', { email, password });
  if (login.user?.role !== 'ADMIN') throw new Error('Admin role is required.');
  const { products: before } = await request('/api/products');
  for (const slug of Object.keys(copy)) assert.ok(before.some(p => p.slug === slug), `Missing product: ${slug}`);
  await fs.writeFile(path.resolve(__dirname, '../../testing/luxury-copy-backup.json'), JSON.stringify(before.filter(p => copy[p.slug]), null, 2));
  for (const product of before.filter(p => copy[p.slug])) {
    await request(`/api/products/${product.id}`, 'PUT', copy[product.slug]);
    console.log(`Description updated: ${product.slug}`);
  }
  const { products: after } = await request('/api/products');
  for (const previous of before.filter(p => copy[p.slug])) {
    const current = after.find(p => p.id === previous.id);
    const { description: oldDescription, shortDescription: oldShort, ...previousData } = previous;
    const { description, shortDescription, ...currentData } = current;
    assert.deepEqual({ description, shortDescription }, copy[current.slug]);
    assert.deepEqual(currentData, previousData, `Other fields changed: ${current.slug}`);
  }
  for (const product of catalog.products) Object.assign(product, copy[product.slug]);
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  const report = { verifiedAt: new Date().toISOString(), updatedProducts: Object.keys(copy).length, fields: ['shortDescription', 'description'], preserved: ['Cloudinary image URLs', 'prices', 'stock', 'variant IDs', 'product names', 'other specifications'] };
  await fs.writeFile(path.resolve(__dirname, '../../testing/luxury-copy-verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
