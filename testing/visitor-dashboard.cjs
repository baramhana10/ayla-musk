const assert = require('node:assert/strict');
const { chromium } = require('../.qa-tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    for (const locale of ['ar', 'en']) {
      for (const width of [390, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 950 } });
        await page.addInitScript(locale => localStorage.setItem('ayla-locale', JSON.stringify({ state: { locale }, version: 0 })), locale);
        await page.route('**/api/**', route => {
          const path = new URL(route.request().url()).pathname;
          const data = path.endsWith('/auth/me') ? { user: { id: 'test', role: 'ADMIN', email: 'test@example.invalid' } }
            : path.endsWith('/admin/stats') ? { revenue: 0, orderCount: 0, avgOrderValue: 0, lowStockCount: 0, visitorCount: 1234, visitors24Hours: 82, visitors7Days: 456 }
            : path.endsWith('/orders') ? { orders: [] } : { products: [] };
          return route.fulfill({ json: data });
        });
        await page.goto('http://localhost:4300/admin');
        await page.getByRole('heading', { name: locale === 'en' ? 'Website visitors' : 'زوار الموقع', exact: true }).waitFor();
        await page.getByText('1,234', { exact: true }).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${locale} ${width}: no horizontal overflow`);
        await page.screenshot({ path: `testing/visitor-dashboard-${locale}-${width}.png`, fullPage: true });
        await page.close();
      }
    }
    console.log('PASS: visitor totals render at 390px and 1440px in Arabic and English without overflow');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
