# Deploying Ayla Musk to the Hostinger VPS

**Target:** VPS `srv1598629.hstgr.cloud` (`187.77.67.77`), Ubuntu 24.04, KVM 1.

```
              nginx :80
        ┌────────┴─────────┐
   /  → │ Next.js :3000    │  pm2: aylamusk-web
 /api → │ Express :4000    │  pm2: aylamusk-api  ── Prisma ── SQLite (backend/prisma/prod.db)
        └──────────────────┘
```

Both processes run under **pm2** (auto-restart, boots on reboot). The DB is a
SQLite file on disk — no separate database server. Migrate to Postgres later by
swapping the Prisma datasource; nothing else in this setup changes.

---

## 1. Push the deploy tooling

From your machine (this repo already has `origin` =
`github.com/baramhana10/ayla-musk`):

```bash
git add deploy DEPLOY.md backend/.env.production.example frontend/.env.production.example backend/prisma/seed.ts
git commit -m "Add VPS deploy tooling"
git push origin main
```

The VPS pulls the code straight from GitHub, so the push is what "ships" it.

## 2. Open a shell on the VPS

hPanel → VPS → **Browser terminal** (or SSH if you have a key:
`ssh root@187.77.67.77`). This sandbox can't reach the box, so you run these.

## 3. First-time provision (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/baramhana10/ayla-musk/main/deploy/setup.sh -o /tmp/setup.sh
PUBLIC_HOST=srv1598629.hstgr.cloud bash /tmp/setup.sh
```

This installs Node 22, pm2, nginx; clones to `/var/www/aylamusk`; builds both
apps; runs DB migrations; **seeds** the catalog + one admin user; wires up nginx
and the firewall; and enables pm2 on boot.

When it finishes it prints the site URL and the generated **admin email +
password** (also saved in `/etc/aylamusk.env`).

Visit: `http://srv1598629.hstgr.cloud` — API health at `/health`.

## 4. Redeploy after any future `git push`

```bash
bash /var/www/aylamusk/deploy/deploy.sh
```

Rebuilds and reloads with zero-ish downtime. It does **not** touch the database.
To wipe and reseed: `RUN_SEED=1 bash /var/www/aylamusk/deploy/deploy.sh`.

## 5. When you buy a domain

1. Point an `A` record at `187.77.67.77` (Hostinger → Domains → DNS).
2. On the VPS:
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   sed -i 's#^PUBLIC_HOST=.*#PUBLIC_HOST=yourdomain.com#; s#^PUBLIC_SCHEME=.*#PUBLIC_SCHEME=https#; s#^PUBLIC_ORIGIN=.*#PUBLIC_ORIGIN=https://yourdomain.com#' /etc/aylamusk.env
   bash /var/www/aylamusk/deploy/deploy.sh   # rebuild so NEXT_PUBLIC_API_URL updates
   ```

---

## Operations

| Task | Command (on VPS) |
|---|---|
| Status | `pm2 status` |
| Logs | `pm2 logs aylamusk-api` / `pm2 logs aylamusk-web` |
| Restart one | `pm2 restart aylamusk-web` |
| Edit config | `nano /etc/aylamusk.env` then `deploy.sh` |
| nginx logs | `tail -f /var/log/nginx/error.log` |
| DB file | `/var/www/aylamusk/backend/prisma/prod.db` (back this up) |

## Notes / gotchas

- **`NEXT_PUBLIC_API_URL` is baked at build time.** Changing the public host
  requires a rebuild (`deploy.sh` handles it).
- **Seeding is destructive** — `prisma/seed.ts` deletes all rows first. `setup.sh`
  only seeds on the first run.
- Default seeded admin is `admin@aylamusk.com` / `admin123` unless you pass
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` to `setup.sh` (recommended).
- SQLite means a single VPS only — don't scale `aylamusk-api` past 1 instance.
- Back up `prod.db` before each redeploy if data matters:
  `cp backend/prisma/prod.db ~/prod.db.$(date +%F)`.
