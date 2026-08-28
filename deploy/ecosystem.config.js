/**
 * PM2 process definitions for the Ayla Musk VPS deployment.
 *
 * Runtime values (JWT secret, public host, DB path) are NOT hard-coded here.
 * They are read from the shell environment that `pm2 start` inherits, which
 * deploy/setup.sh and deploy/deploy.sh populate from /etc/aylamusk.env.
 *
 * Start with:   pm2 start deploy/ecosystem.config.js
 * Reload with:  pm2 reload deploy/ecosystem.config.js --update-env
 */
const path = require("path");
const ROOT = __dirname.replace(/[\\/]deploy$/, "");

module.exports = {
  apps: [
    {
      name: "aylamusk-api",
      cwd: path.join(ROOT, "backend"),
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.API_PORT || "4000",
        DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/prod.db",
        JWT_SECRET: process.env.JWT_SECRET,
        CLIENT_ORIGIN: process.env.PUBLIC_ORIGIN,
        // Cloudinary — signed browser uploads for product/category images.
        // Empty until set in /etc/aylamusk.env; uploads 503 until then.
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
      },
    },
    {
      name: "aylamusk-web",
      cwd: path.join(ROOT, "frontend"),
      // `next start` — serves the production build in .next
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${process.env.WEB_PORT || "3000"}`,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.WEB_PORT || "3000",
      },
    },
  ],
};
