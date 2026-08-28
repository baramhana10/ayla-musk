#!/usr/bin/env bash
#
# One-time provisioning for the Ayla Musk stack on a fresh Ubuntu 22.04/24.04 VPS.
# Safe to re-run — every step is idempotent.
#
#   Frontend : Next.js  (next start)  -> 127.0.0.1:3000   [pm2: aylamusk-web]
#   Backend  : Express + Prisma/SQLite -> 127.0.0.1:4000  [pm2: aylamusk-api]
#   Edge     : nginx :80  ->  / to web, /api + /health to api
#
# Usage (as root):
#   curl -fsSL https://raw.githubusercontent.com/baramhana10/ayla-musk/main/deploy/setup.sh -o setup.sh
#   PUBLIC_HOST=srv1598629.hstgr.cloud bash setup.sh
#
# Optional env overrides:
#   PUBLIC_HOST     hostname/IP nginx answers on         (default: server hostname -f)
#   PUBLIC_SCHEME   http | https                         (default: http)
#   REPO_URL        git remote to clone                  (default: this repo, https)
#   APP_DIR         checkout location                    (default: /var/www/aylamusk)
#   BRANCH          branch to deploy                     (default: main)
#   JWT_SECRET      auth signing secret                  (default: generated once)
#   ADMIN_EMAIL     seeded admin login                   (default: admin@aylamusk.com)
#   ADMIN_PASSWORD  seeded admin password                (default: generated once)
#   RUN_SEED        1 to (re)seed the DB this run        (default: 1 only on first setup)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/baramhana10/ayla-musk.git}"
APP_DIR="${APP_DIR:-/var/www/aylamusk}"
BRANCH="${BRANCH:-main}"
ENV_FILE=/etc/aylamusk.env
NODE_MAJOR=22

if [[ $EUID -ne 0 ]]; then echo "Run as root (sudo -i)." >&2; exit 1; fi

echo "==> [1/8] System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg git build-essential python3 nginx ufw >/dev/null

echo "==> [2/8] Node.js ${NODE_MAJOR}.x"
if ! command -v node >/dev/null || [[ "$(node -v)" != v${NODE_MAJOR}.* ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
node -v
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null
pm2 -v

echo "==> [3/8] Persisted config -> ${ENV_FILE}"
# Load any existing values so re-runs keep the same secret / password.
[[ -f "$ENV_FILE" ]] && set -a && . "$ENV_FILE" && set +a

FIRST_RUN=0; [[ -f "$ENV_FILE" ]] || FIRST_RUN=1
PUBLIC_HOST="${PUBLIC_HOST:-$(hostname -f 2>/dev/null || hostname)}"
PUBLIC_SCHEME="${PUBLIC_SCHEME:-http}"
PUBLIC_ORIGIN="${PUBLIC_SCHEME}://${PUBLIC_HOST}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 48)}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@aylamusk.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 12)}"
RUN_SEED="${RUN_SEED:-$FIRST_RUN}"

# Cloudinary — product/category image uploads. Blank by default; fill these in
# (here or by passing them to this script) and re-run deploy/deploy.sh. Until
# set, the admin image uploader returns "not configured".
CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY:-}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET:-}"
CLOUDINARY_FOLDER="${CLOUDINARY_FOLDER:-aylamusk}"

cat > "$ENV_FILE" <<EOF
# Written by deploy/setup.sh — edit here, then re-run deploy/deploy.sh
PUBLIC_HOST=${PUBLIC_HOST}
PUBLIC_SCHEME=${PUBLIC_SCHEME}
PUBLIC_ORIGIN=${PUBLIC_ORIGIN}
API_PORT=4000
WEB_PORT=3000
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
CLOUDINARY_FOLDER=${CLOUDINARY_FOLDER}
EOF
chmod 600 "$ENV_FILE"
echo "    PUBLIC_ORIGIN = ${PUBLIC_ORIGIN}"

echo "==> [4/8] Source checkout -> ${APP_DIR}"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/${BRANCH}"
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

echo "==> [5/8] Build + start (deploy/deploy.sh)"
RUN_SEED="$RUN_SEED" bash "$APP_DIR/deploy/deploy.sh"

echo "==> [6/8] nginx site"
SITE=/etc/nginx/sites-available/aylamusk
sed "s/__SERVER_NAME__/${PUBLIC_HOST}/g" "$APP_DIR/deploy/nginx.conf" > "$SITE"
ln -sf "$SITE" /etc/nginx/sites-enabled/aylamusk
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
systemctl enable nginx >/dev/null

echo "==> [7/8] Firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

echo "==> [8/8] pm2 boot persistence"
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || pm2 startup >/dev/null 2>&1 || true
pm2 save

echo
echo "======================================================================"
echo " Ayla Musk is live:   ${PUBLIC_ORIGIN}"
echo "   API health:        ${PUBLIC_ORIGIN}/health"
if [[ "$RUN_SEED" == "1" ]]; then
  echo "   Admin login:       ${ADMIN_EMAIL}"
  echo "   Admin password:    ${ADMIN_PASSWORD}"
  echo "   (also stored in ${ENV_FILE})"
fi
echo
echo " Redeploy after a push:   bash ${APP_DIR}/deploy/deploy.sh"
echo " Add HTTPS (after DNS):   apt-get install -y certbot python3-certbot-nginx \\"
echo "                          && certbot --nginx -d ${PUBLIC_HOST}"
echo "                          then set PUBLIC_SCHEME=https in ${ENV_FILE} and redeploy"
echo "======================================================================"
