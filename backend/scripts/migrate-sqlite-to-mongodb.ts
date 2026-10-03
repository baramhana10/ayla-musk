import "dotenv/config";
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";

type SqliteRow = Record<string, unknown>;

const sqlitePath = process.env.SQLITE_DATABASE_PATH;
const resetTarget = process.env.MIGRATION_RESET === "1";

if (!sqlitePath) {
  throw new Error(
    "SQLITE_DATABASE_PATH is required (for example: /var/www/aylamusk/backend/prisma/prod.db).",
  );
}

if (!process.env.DATABASE_URL?.startsWith("mongodb")) {
  throw new Error("DATABASE_URL must be a MongoDB connection string.");
}

const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });
const prisma = new PrismaClient();

function rows(table: string): SqliteRow[] {
  return sqlite.prepare(`SELECT * FROM "${table}"`).all() as SqliteRow[];
}

function date(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  throw new Error(`Expected a date value, received ${String(value)}.`);
}

function boolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

async function targetHasData(): Promise<boolean> {
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.coupon.count(),
  ]);
  return counts.some((count) => count > 0);
}

async function clearTarget() {
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
}

async function insertAll<T extends SqliteRow>(records: T[], insert: (record: T) => Promise<unknown>) {
  for (const record of records) await insert(record);
}

async function main() {
  await prisma.$connect();

  if (await targetHasData()) {
    if (!resetTarget) {
      throw new Error(
        "The MongoDB target is not empty. Refusing to overwrite it; set MIGRATION_RESET=1 only if wiping it is intentional.",
      );
    }
    console.warn("Clearing the MongoDB target because MIGRATION_RESET=1.");
    await clearTarget();
  }

  const users = rows("User");
  const addresses = rows("Address");
  const categories = rows("Category");
  const products = rows("Product");
  const variants = rows("ProductVariant");
  const reviews = rows("Review");
  const cartItems = rows("CartItem");
  const wishlistItems = rows("WishlistItem");
  const orders = rows("Order");
  const orderItems = rows("OrderItem");
  const coupons = rows("Coupon");

  await insertAll(users, (record) =>
    prisma.user.create({ data: { ...record, createdAt: date(record.createdAt) } as never }),
  );
  await insertAll(addresses, (record) =>
    prisma.address.create({ data: { ...record, isDefault: boolean(record.isDefault) } as never }),
  );
  await insertAll(categories, (record) => prisma.category.create({ data: record as never }));
  await insertAll(products, (record) =>
    prisma.product.create({
      data: {
        ...record,
        featured: boolean(record.featured),
        bestseller: boolean(record.bestseller),
        isNew: boolean(record.isNew),
        prescriptionAvailable: boolean(record.prescriptionAvailable),
        createdAt: date(record.createdAt),
        updatedAt: date(record.updatedAt),
      } as never,
    }),
  );
  await insertAll(variants, (record) => prisma.productVariant.create({ data: record as never }));
  await insertAll(reviews, (record) =>
    prisma.review.create({
      data: { ...record, verified: boolean(record.verified), createdAt: date(record.createdAt) } as never,
    }),
  );
  await insertAll(cartItems, (record) =>
    prisma.cartItem.create({ data: { ...record, createdAt: date(record.createdAt) } as never }),
  );
  await insertAll(wishlistItems, (record) =>
    prisma.wishlistItem.create({ data: { ...record, createdAt: date(record.createdAt) } as never }),
  );
  await insertAll(orders, (record) =>
    prisma.order.create({ data: { ...record, createdAt: date(record.createdAt) } as never }),
  );
  await insertAll(orderItems, (record) => prisma.orderItem.create({ data: record as never }));
  await insertAll(coupons, (record) =>
    prisma.coupon.create({ data: { ...record, active: boolean(record.active) } as never }),
  );

  console.log(
    `Migrated ${users.length} users, ${products.length} products, ${orders.length} orders, and related records to MongoDB.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
