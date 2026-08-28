#!/usr/bin/env bash
#
# Build + (re)start the Ayla Musk stack. Run this after every `git push`.
#
#   bash /var/www/aylamusk/deploy/deploy.sh
#
# Honours /etc/aylamusk.env (written by deploy/setup.sh).
#   RUN_SEED=1 bash deploy/deploy.sh   # wipe + reseed the database
set -euo pipefail

ENV_FILE=/etc/aylamusk.env
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE — run deploy/setup.sh first." >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_SEED="${RUN_SEED:-0}"
cd "$APP_DIR"

echo "==> Pulling ${BRANCH:-main}"
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
git fetch --depth 1 origin "${BRANCH:-main}"
git reset --hard "origin/${BRANCH:-main}"

# Build tools live in devDependencies — force them in regardless of NODE_ENV.
export NODE_ENV=development
NPM_CI="npm ci --no-audit --no-fund --include=dev"

echo "==> Backend: install / generate / migrate / build"
pushd backend >/dev/null
  $NPM_CI
  npx prisma generate
  npx prisma migrate deploy
  npm run build
  if [[ "$RUN_SEED" == "1" ]]; then
    echo "    seeding database (destructive)"
    npm run seed
  fi
popd >/dev/null

echo "==> Frontend: install / build  (NEXT_PUBLIC_API_URL=${PUBLIC_ORIGIN})"
pushd frontend >/dev/null
  $NPM_CI
  # next build MUST run as production — devDeps are already installed above via
  # --include=dev, and NODE_ENV=development breaks React's static prerender
  # (TypeError: Cannot read properties of null (reading 'useContext')).
  NODE_ENV=production NEXT_PUBLIC_API_URL="${PUBLIC_ORIGIN}" NEXT_TELEMETRY_DISABLED=1 npm run build
popd >/dev/null

echo "==> pm2 (re)start"
unset NODE_ENV
if pm2 describe aylamusk-api >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.js --update-env
else
  pm2 start deploy/ecosystem.config.js --update-env
fi
pm2 save

echo "==> Health check"
sleep 2
curl -fsS "http://127.0.0.1:${API_PORT:-4000}/health" && echo
curl -fsS -o /dev/null -w "web: HTTP %{http_code}\n" "http://127.0.0.1:${WEB_PORT:-3000}/"
echo "==> Done."
