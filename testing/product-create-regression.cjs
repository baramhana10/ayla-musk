// Isolated regression checks: no production database or network requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('../frontend/node_modules/typescript');

function loadTs(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return mod.exports;
}

async function main() {
  const { slugify } = loadTs('frontend/src/lib/utils.ts');
  assert.equal(slugify('  Rose & Musk  '), 'rose-musk');
  assert.equal(slugify('مسك أبيض'), 'مسك-أبيض');
  assert.equal(slugify('Rose مسك'), 'rose-مسك');
  assert.equal(slugify('Café'), slugify('Cafe\u0301'));

  process.env.JWT_SECRET = 'isolated-product-regression-only';
  require('../backend/node_modules/ts-node').register({
    transpileOnly: true,
    compilerOptions: { module: 'CommonJS', moduleResolution: 'node' },
  });
  const prismaPath = require.resolve('../backend/src/lib/prisma.ts');
  let writes = 0;
  require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: {
    prisma: { product: { create: async ({ data }) => {
      writes++;
      return { ...data, id: 'fixture', variants: data.variants.create };
    } } },
  } };
  const express = require('../backend/node_modules/express');
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { if (req.headers['x-test-admin']) req.user = { role: 'ADMIN' }; next(); });
  app.use('/api/products', require('../backend/src/routes/products.routes.ts').default);
  app.use(require('../backend/src/middleware/errorHandler.ts').errorHandler);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const realFetch = global.fetch;
  const base = `http://127.0.0.1:${server.address().port}`;
  const payload = { name: 'مسك أبيض', slug: slugify('مسك أبيض'), department: 'perfumes',
    accent: '#9c5a63', shortDescription: 'Test', description: '', images: [],
    variants: [{ sizeMl: 30, price: 6000, stock: 20 }], featured: false, bestseller: false, isNew: false };
  const post = (body, admin = true) => realFetch(`${base}/api/products`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { 'x-test-admin': '1' } : {}) },
    body: JSON.stringify(body),
  });
  try {
    const invalid = await post({ ...payload, slug: '' });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).details[0].path, 'slug');
    const created = await post(payload);
    assert.equal(created.status, 201);
    assert.equal((await created.json()).product.slug, 'مسك-أبيض');
    assert.equal((await post(payload, false)).status, 401);
    assert.equal(writes, 1);

    const { productsApi, ApiClientError } = loadTs('frontend/src/lib/api.ts');
    global.fetch = (_url, options) => realFetch(`${base}/api/products`, {
      ...options, headers: { ...options.headers, 'x-test-admin': '1' },
    });
    await assert.rejects(productsApi.create({ ...payload, slug: '' }), error =>
      error instanceof ApiClientError && error.status === 400 && error.message.includes('slug:'));
    console.log('PASS: Arabic/English slugs, Arabic product creation, validation details, and authentication guard.');
  } finally {
    global.fetch = realFetch;
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
