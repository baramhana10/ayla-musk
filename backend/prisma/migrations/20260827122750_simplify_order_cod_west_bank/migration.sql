/*
  Warnings:

  - You are about to drop the column `address1` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cardLast4` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Order` table. All the data in the column will be lost.
  - Added the required column `address` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "shipping" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "couponCode" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("city", "couponCode", "createdAt", "discount", "fullName", "id", "phone", "shipping", "status", "subtotal", "total", "userId") SELECT "city", "couponCode", "createdAt", "discount", "fullName", "id", "phone", "shipping", "status", "subtotal", "total", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
