import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

/**
 * Seed = a clean, empty store with a single admin account.
 *
 * There is intentionally no demo catalog. Add real categories and products
 * through the admin panel; product photos upload to Cloudinary from there.
 * Re-running this is destructive: it clears every table first.
 */
async function main() {
  console.log("Seeding database (clean slate)...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@aylamusk.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: { email: adminEmail, name: "Ayla Admin", passwordHash: adminPasswordHash, role: "ADMIN" },
  });

  console.log(`Done. Admin user: ${adminEmail} (no products, categories, or coupons).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
