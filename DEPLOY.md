# Deploying Ayla Musk with MongoDB

The production stack is Next.js, Express, Prisma, and **MongoDB Atlas**. The
app runs on the Hostinger VPS through PM2, with nginx routing `/` to the web app
and `/api` to the API.

MongoDB Atlas is the recommended database host. The app uses Prisma
transactions when placing an order, so the database must be a MongoDB replica
set; Atlas provides that by default.

## 1. Create the MongoDB database

In MongoDB Atlas, create a cluster and a database user with read/write access
to the `aylamusk` database. Add the Hostinger VPS public IP to Atlas Network
Access, then copy its driver connection string. Its shape is:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/aylamusk?retryWrites=true&w=majority
```

Use a URL-encoded password: for example, replace `@` with `%40` and `#` with
`%23`. Never commit this value to Git.

## 2. Move an existing VPS from SQLite to MongoDB

First push this version of the project to the repository used by the VPS. Then
open the Hostinger VPS Browser Terminal (or SSH) and run the following as root.
This briefly stops API writes so the data copy is consistent.

```bash
pm2 stop aylamusk-api
cp /var/www/aylamusk/backend/prisma/prod.db /root/aylamusk-sqlite-before-mongo.db
nano /etc/aylamusk.env
```

In that file, replace its `DATABASE_URL` line with the Atlas URL, wrapped in
single quotes:

```bash
DATABASE_URL='mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/aylamusk?retryWrites=true&w=majority'
```

Then perform the one-time migration and deployment:

```bash
MIGRATE_SQLITE_PATH=/root/aylamusk-sqlite-before-mongo.db bash /var/www/aylamusk/deploy/deploy.sh
```

The deploy script pulls the latest code, creates MongoDB collections with
`prisma db push`, copies every SQLite record while preserving IDs and
relationships, builds both apps, and starts PM2 again. It stops before PM2 is
reloaded if the transfer fails. The SQLite backup in `/root` is left intact.

Confirm the result:

```bash
pm2 status
pm2 logs aylamusk-api --lines 50
curl -fsS http://127.0.0.1:4000/health
```

Do **not** use `RUN_SEED=1` during this migration: seeding intentionally wipes
the MongoDB target.

## 3. Deploy to a fresh Hostinger VPS

Run the provisioner with the Atlas URL supplied only to the shell:

```bash
curl -fsSL https://raw.githubusercontent.com/baramhana10/ayla-musk/main/deploy/setup.sh -o /tmp/setup.sh
DATABASE_URL='mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/aylamusk?retryWrites=true&w=majority' PUBLIC_HOST=your-domain.com bash /tmp/setup.sh
```

The first deployment creates an empty database and seeds the configured admin
account. For future releases, push the code and run:

```bash
bash /var/www/aylamusk/deploy/deploy.sh
```

## Operations

| Task | Command |
| --- | --- |
| App status | `pm2 status` |
| API logs | `pm2 logs aylamusk-api` |
| Reload after config change | `bash /var/www/aylamusk/deploy/deploy.sh` |
| Edit secrets | `nano /etc/aylamusk.env` |
| Check the API locally | `curl -fsS http://127.0.0.1:4000/health` |

Back up the database using Atlas backups/snapshots, rather than copying a
database file from the VPS. Keep `/etc/aylamusk.env` readable only by root.
