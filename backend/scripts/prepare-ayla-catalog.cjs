const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('../../frontend/node_modules/sharp');
const catalog = require('../catalog/ayla-products.json');

const root = path.resolve(__dirname, '../..');
// These are upload inputs, not a storefront catalog or a frontend fallback.
const output = path.join(root, 'backend/catalog/images');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

async function main() {
  await fs.mkdir(output, { recursive: true });
  let originalBytes = 0;
  let optimizedBytes = 0;
  for (const product of catalog.products) {
    const input = path.join(root, `ayla-product/product (${product.sourceImage}).png`);
    const target = path.join(output, `${product.slug}.webp`);
    originalBytes += (await fs.stat(input)).size;
    await sharp(input).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toFile(target);
    optimizedBytes += (await fs.stat(target)).size;
  }

  const inventoryPath = path.join(root, 'backend/catalog/ayla-inventory.json');
  try { await fs.access(inventoryPath); }
  catch {
    await fs.writeFile(inventoryPath, JSON.stringify(Object.fromEntries(catalog.products.map(p => [p.slug, { publish: false, priceILS: null, stock: null }])), null, 2) + '\n');
  }

  const cards = catalog.products.map(product => `<article id="${escape(product.slug)}" style="--accent:${escape(product.accent)}">
    <div class="photo"><img src="images/${escape(product.slug)}.webp" alt="${escape(product.name)}" loading="lazy"><span class="number">${String(product.sourceImage).padStart(2, '0')}</span></div>
    <div class="content"><p class="category">${escape(catalog.categories.find(c => c.slug === product.category).name)}</p><h2>${escape(product.name)}</h2><p class="lead">${escape(product.shortDescription)}</p><p>${escape(product.description)}</p>
    ${product.benefits ? `<h3>المزايا</h3><ul>${product.benefits.map(value => `<li>${escape(value)}</li>`).join('')}</ul>` : ''}
    ${product.ingredients ? `<h3>المكونات المدوّنة على العبوة</h3><p>${escape(product.ingredients.join('، '))}</p>` : ''}
    ${product.howToUse ? `<h3>طريقة الاستخدام</h3><p>${escape(product.howToUse)}</p>` : ''}
    <dl><div><dt>الخيار</dt><dd>${escape(product.variantLabel)}</dd></div><div><dt>السعر والمخزون</dt><dd>بانتظار بيانات المتجر</dd></div></dl>
    <details><summary>بيانات تحتاج إلى تأكيد</summary><ul>${product.reviewRequired.map(value => `<li>${escape(value)}</li>`).join('')}</ul></details></div>
  </article>`);
  const grouped = catalog.categories.map(category => `<section id="${escape(category.slug)}"><h2>${escape(category.name)}</h2>${catalog.products.map((p, i) => p.category === category.slug ? cards[i] : '').join('\n')}</section>`).join('\n');
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>كتالوج آيلا مسك — مراجعة بيانات المنتجات</title><style>
    *{box-sizing:border-box}body{margin:0;background:#faf6f0;color:#382c2e;font-family:Tahoma,Arial,sans-serif;line-height:1.9}header{background:#392a2e;color:#fcf6ed;padding:64px max(24px,calc((100vw - 1200px)/2));border-bottom:4px solid #bd9a66}header small{color:#d7b888;letter-spacing:2px}h1{font-size:clamp(30px,5vw,54px);line-height:1.4;margin:12px 0}header p{max-width:670px;color:#e6d8d9}nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:25px}nav a{color:#f6e8d7;text-decoration:none;border:1px solid #76615e;border-radius:30px;padding:7px 18px;font-size:13px}nav a:hover,nav a:focus-visible{background:#795d63}main{max-width:1200px;margin:auto;padding:40px 24px}section>h2{font-size:25px;border-bottom:1px solid #d9c8bc;padding-bottom:14px;margin-top:60px}article{display:grid;grid-template-columns:minmax(250px,42%) 1fr;border:1px solid #e3d8cd;margin:24px 0 40px;background:#fffdfa;border-radius:20px;overflow:hidden}.photo{position:relative;background:#f5e7df}.photo img{width:100%;height:auto;display:block}.number{position:absolute;top:16px;right:16px;background:#fffcf2e6;border-radius:30px;padding:2px 12px;font-size:13px}.content{padding:28px}.category{color:#976a6f;font-size:12px;letter-spacing:1px;margin:0}.content h2{font-size:25px;line-height:1.6;margin:7px 0 14px}.lead{color:#8b535e;font-weight:bold}.content p,.content li{font-size:14px}.content h3{font-size:13px;margin:20px 0 6px}ul{padding-inline-start:20px}dl{display:flex;gap:24px;flex-wrap:wrap;border-top:1px solid #eaded3;padding-top:15px;font-size:13px}dt{color:#88696a}dd{margin:4px 0}details{background:#f6f0e7;padding:12px 16px;border-radius:10px;font-size:13px}summary{cursor:pointer;color:#79515b}footer{text-align:center;color:#897575;padding:35px;font-size:12px}@media(max-width:700px){header{padding:40px 24px}article{grid-template-columns:1fr}.content{padding:24px}.photo img{max-height:420px;object-fit:contain}main{padding:20px 16px}}@media print{header{padding:24px}article{break-inside:avoid}details{display:block}}
  </style></head><body><header><small>AYLA MUSK · آيلا مسك</small><h1>تفاصيل تستحق العناية</h1><p>كتالوج مراجعة عربي يطابق الصور المرفقة. الأسعار والكميات والمعلومات غير الظاهرة تنتظر بيانات المتجر؛ هذه المعاينة لا تعني نشر المنتجات أو إتاحتها للبيع.</p><nav>${catalog.categories.map(c => `<a href="#${escape(c.slug)}">${escape(c.name)}</a>`).join('')}</nav></header><main>${grouped}</main><footer>آيلا مسك · بيانات للمراجعة قبل النشر</footer></body></html>`;
  await fs.writeFile(path.join(root, 'backend/catalog/preview.html'), html);
  console.log(JSON.stringify({ images: catalog.products.length, originalBytes, optimizedBytes, reductionPercent: Math.round((1 - optimizedBytes / originalBytes) * 100), preview: 'backend/catalog/preview.html' }, null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
