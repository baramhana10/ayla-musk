-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "image" TEXT,
    "label" TEXT,
    "sizeMl" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("accent", "id", "image", "orderId", "price", "productId", "productName", "quantity", "sizeMl", "variantId") SELECT "accent", "id", "image", "orderId", "price", "productId", "productName", "quantity", "sizeMl", "variantId" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandLine" TEXT,
    "department" TEXT NOT NULL DEFAULT 'perfumes',
    "categorySlug" TEXT,
    "accent" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scentFamily" TEXT,
    "gender" TEXT,
    "notesTop" TEXT DEFAULT '[]',
    "notesHeart" TEXT DEFAULT '[]',
    "notesBase" TEXT DEFAULT '[]',
    "benefits" TEXT DEFAULT '[]',
    "ingredients" TEXT DEFAULT '[]',
    "howToUse" TEXT,
    "skinHairType" TEXT,
    "lensType" TEXT,
    "lensColor" TEXT,
    "diameter" TEXT,
    "baseCurve" TEXT,
    "replacementDuration" TEXT,
    "material" TEXT,
    "waterContent" TEXT,
    "prescriptionAvailable" BOOLEAN NOT NULL DEFAULT false,
    "imagesJson" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "bestseller" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category" ("slug") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("accent", "bestseller", "brandLine", "categorySlug", "createdAt", "description", "featured", "id", "imagesJson", "isNew", "name", "notesBase", "notesHeart", "notesTop", "rating", "reviewCount", "scentFamily", "shortDescription", "slug", "updatedAt") SELECT "accent", "bestseller", "brandLine", "categorySlug", "createdAt", "description", "featured", "id", "imagesJson", "isNew", "name", "notesBase", "notesHeart", "notesTop", "rating", "reviewCount", "scentFamily", "shortDescription", "slug", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "label" TEXT,
    "sizeMl" INTEGER,
    "price" INTEGER NOT NULL,
    "compareAtPrice" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("compareAtPrice", "id", "price", "productId", "sizeMl", "stock") SELECT "compareAtPrice", "id", "price", "productId", "sizeMl", "stock" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
