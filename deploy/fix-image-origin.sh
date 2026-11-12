#!/usr/bin/env bash
# Repair the running web process without rebuilding or changing store data.
set -euo pipefail

ENV_FILE=/etc/aylamusk.env
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a
. "$ENV_FILE"
set +a

[[ -n "${PUBLIC_ORIGIN:-}" ]] || { echo "PUBLIC_ORIGIN is missing in $ENV_FILE" >&2; exit 1; }
node -e 'const u = new URL(process.env.PUBLIC_ORIGIN); if (!["http:", "https:"].includes(u.protocol) || u.username || u.password || u.pathname !== "/" || u.search || u.hash) throw new Error("PUBLIC_ORIGIN must be a website origin");'

export NEXT_PUBLIC_API_URL="$PUBLIC_ORIGIN"
pm2 restart aylamusk-web --update-env
pm2 save

# Exercise the same optimizer route used by the storefront, not just GridFS.
node <<'JS'
const origin = process.env.PUBLIC_ORIGIN;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const response = await fetch(`${origin}/api/products`, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Catalog returned HTTP ${response.status}`);
      const { products } = await response.json();
      const image = products.flatMap(product => product.images ?? []).find(url => url.startsWith(`${origin}/api/uploads/`));
      if (!image) throw new Error('No uploaded product photo found to verify');
      const url = `${origin}/_next/image?url=${encodeURIComponent(image)}&w=640&q=75`;
      const optimized = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!optimized.ok || !optimized.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`Image optimizer returned HTTP ${optimized.status}`);
      }
      await optimized.arrayBuffer();
      console.log('Verified: uploaded product image renders through the live image optimizer.');
      return;
    } catch (error) {
      if (attempt === 9) throw error;
      await pause(1000);
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
JS
