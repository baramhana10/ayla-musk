import { config } from "dotenv";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod";

config({ path: path.resolve(__dirname, "../.env"), quiet: true });
config({ path: path.resolve(__dirname, "../.env.catalog.local"), quiet: true });

const arabicText = z.string().min(1).refine(value => /[\u0600-\u06ff]/u.test(value), "Arabic copy is required");
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const categorySchema = z.enum(["musk-oil", "gift-sets", "body-butter", "body-scrub", "hair-body-care"]);
const catalogSchema = z.object({
  version: z.literal(1),
  brand: arabicText,
  currency: z.literal("ILS"),
  categories: z.array(z.object({ slug: categorySchema, name: arabicText, description: arabicText, imageSlug: slugSchema })).min(1),
  products: z.array(z.object({
    sourceImage: z.number().int().positive(),
    slug: slugSchema,
    name: arabicText,
    department: z.enum(["perfumes", "body-care"]),
    category: categorySchema,
    accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    shortDescription: arabicText,
    description: arabicText,
    variantLabel: arabicText,
    sizeMl: z.number().int().positive().optional(),
    benefits: z.array(arabicText).optional(),
    ingredients: z.array(arabicText).optional(),
    howToUse: arabicText.optional(),
    skinHairType: arabicText.optional(),
    reviewRequired: z.array(arabicText),
  })).min(1),
});
const inventoryEntrySchema = z.object({
  publish: z.boolean(),
  priceILS: z.number().min(0).max(1_000_000).nullable(),
  stock: z.number().int().min(0).max(1_000_000).nullable(),
  // Use overrides for confirmed names/sizes rather than guessing from color.
  name: arabicText.optional(),
  description: arabicText.optional(),
  shortDescription: arabicText.optional(),
  variantLabel: arabicText.optional(),
  sizeMl: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
}).strict();
const inventorySchema = z.record(slugSchema, inventoryEntrySchema);
type Catalog = z.infer<typeof catalogSchema>;
type InventoryEntry = z.infer<typeof inventoryEntrySchema>;
type CatalogProduct = Catalog["products"][number];

export function buildProductPayload(product: CatalogProduct, inventory: InventoryEntry, image: string, brand: string, pendingPricing = false) {
  if (inventory.priceILS === null || inventory.stock === null) {
    throw new Error(`${product.slug}: supply a real priceILS and stock before uploading.`);
  }
  if (inventory.priceILS === 0 && !pendingPricing) throw new Error(`${product.slug}: zero is reserved for explicitly requested pending pricing.`);
  const cents = Math.round(inventory.priceILS * 100);
  if (Math.abs(inventory.priceILS * 100 - cents) > 0.000001) {
    throw new Error(`${product.slug}: priceILS must have at most two decimal places.`);
  }
  return {
    name: inventory.name ?? product.name,
    slug: product.slug,
    brandLine: brand,
    department: product.department,
    category: product.category,
    accent: product.accent,
    shortDescription: inventory.shortDescription ?? product.shortDescription,
    description: inventory.description ?? product.description,
    benefits: product.benefits ?? [],
    ingredients: product.ingredients ?? [],
    howToUse: product.howToUse,
    skinHairType: product.skinHairType,
    images: [image],
    variants: [{ label: inventory.variantLabel ?? product.variantLabel, sizeMl: inventory.sizeMl ?? product.sizeMl, price: cents, stock: inventory.stock }],
    featured: inventory.featured ?? false,
    bestseller: false,
    isNew: true,
  };
}

async function loadInputs(inventoryPath: string) {
  const catalog = catalogSchema.parse(JSON.parse(await readFile(path.resolve(__dirname, "../catalog/ayla-products.json"), "utf8")));
  const inventory = inventorySchema.parse(JSON.parse(await readFile(inventoryPath, "utf8")));
  const slugs = new Set(catalog.products.map(p => p.slug));
  if (slugs.size !== catalog.products.length) throw new Error("Duplicate catalog slugs.");
  if (new Set(catalog.products.map(p => p.sourceImage)).size !== catalog.products.length) throw new Error("Duplicate source-image assignments.");
  for (const slug of Object.keys(inventory)) {
    if (!slugs.has(slug)) throw new Error(`Unknown inventory slug: ${slug}`);
  }
  const categories = new Set(catalog.categories.map(c => c.slug));
  for (const category of catalog.categories) {
    if (!slugs.has(category.imageSlug)) throw new Error(`Category image does not exist: ${category.imageSlug}`);
  }
  for (const product of catalog.products) {
    if (!categories.has(product.category)) throw new Error(`Unknown category for ${product.slug}`);
    if (!inventory[product.slug]) throw new Error(`Missing inventory entry: ${product.slug}`);
    const image = await stat(imagePath(product.slug));
    if (image.size === 0 || image.size > 10 * 1024 * 1024) throw new Error(`Invalid upload size: ${product.slug}`);
  }
  return { catalog, inventory };
}

function imagePath(slug: string) {
  return path.resolve(__dirname, "../catalog/images", `${slug}.webp`);
}

class AdminApi {
  private cookie = "";
  constructor(private readonly origin: string) {}

  async request<T>(endpoint: string, method = "GET", body?: unknown): Promise<T> {
    const response = await fetch(this.origin + endpoint, {
      method,
      headers: { ...(this.cookie ? { Cookie: this.cookie } : {}), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`${method} ${endpoint} returned HTTP ${response.status}.`);
    const cookies = response.headers.getSetCookie();
    if (cookies.length) this.cookie = cookies.map(cookie => cookie.split(";")[0]).join("; ");
    return await response.json() as T;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: { role: string } }>("/api/auth/login", "POST", { email, password });
    if (result.user.role !== "ADMIN" || !this.cookie) throw new Error("An authenticated admin account is required.");
  }

  async upload(product: CatalogProduct) {
    const image = await readFile(imagePath(product.slug));
    const response = await fetch(this.origin + "/api/uploads", {
      method: "POST",
      headers: { Cookie: this.cookie, "Content-Type": "image/webp", "X-File-Name": encodeURIComponent(`${product.name}.webp`) },
      body: new Uint8Array(image),
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`Image upload for ${product.slug} returned HTTP ${response.status}.`);
    const { url } = z.object({ url: z.string().url() }).parse(await response.json());
    const publicUrl = new URL(url);
    const isGridFs = publicUrl.origin === this.origin && publicUrl.pathname.startsWith("/api/uploads/");
    const isCloudinary = publicUrl.protocol === "https:" && publicUrl.hostname === "res.cloudinary.com";
    if (!isGridFs && !isCloudinary) {
      throw new Error(`Upload returned an unexpected image origin for ${product.slug}.`);
    }
    // Verify the server stored and can serve the uploaded bytes before using it.
    const downloaded = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
    if (!downloaded.ok || !Buffer.from(await downloaded.arrayBuffer()).equals(image)) {
      throw new Error(`Uploaded image verification failed for ${product.slug}.`);
    }
    return url;
  }
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: { apply: { type: "boolean", default: false }, "dry-run": { type: "boolean", default: false }, "stage-media": { type: "boolean", default: false }, "pending-pricing": { type: "boolean", default: false }, "refresh-categories": { type: "boolean", default: false }, inventory: { type: "string" }, report: { type: "string" }, "media-report": { type: "string" }, "api-url": { type: "string" } }, allowPositionals: false });
  if (values.apply && values["dry-run"]) throw new Error("Choose --apply or --dry-run.");
  const { catalog, inventory } = await loadInputs(path.resolve(values.inventory ?? path.resolve(__dirname, "../catalog/ayla-inventory.json")));
  if (values["pending-pricing"]) {
    for (const product of catalog.products) inventory[product.slug] = { ...inventory[product.slug], publish: true, priceILS: 0, stock: 0 };
  }
  const selected = values["stage-media"] ? [] : catalog.products.filter(product => inventory[product.slug].publish);
  // Check the entire selected batch before any network request or write.
  const payloads = selected.map(product => buildProductPayload(product, inventory[product.slug], "https://example.invalid/validated-before-upload.webp", catalog.brand, values["pending-pricing"]));
  console.log(JSON.stringify({ mode: values.apply ? values["stage-media"] ? "stage-media" : "upload" : "dry-run", catalogProducts: catalog.products.length, selected: selected.length, pending: catalog.products.length - selected.length, products: payloads.map(p => ({ slug: p.slug, name: p.name, priceILS: p.variants[0].price / 100, stock: p.variants[0].stock })) }, null, 2));
  if (!values.apply) return;
  if (!selected.length && !values["stage-media"]) throw new Error("No products selected. Fill the inventory file with real prices and stock, then set publish: true for the products to upload.");

  const rawUrl = values["api-url"] ?? process.env.CATALOG_API_URL;
  if (!rawUrl) throw new Error("Set CATALOG_API_URL to the live website origin, for example https://your-store.com.");
  const originUrl = new URL(rawUrl);
  if (!/^https?:$/.test(originUrl.protocol) || originUrl.username || originUrl.password || originUrl.search || originUrl.hash || (originUrl.pathname !== "/" && originUrl.pathname !== "")) {
    throw new Error("CATALOG_API_URL must be a website origin without credentials, a path or query parameters.");
  }
  if (originUrl.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(originUrl.hostname)) {
    throw new Error("Use HTTPS to sign in to a remote website.");
  }
  const email = process.env.CATALOG_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
  const password = process.env.CATALOG_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set CATALOG_ADMIN_EMAIL and CATALOG_ADMIN_PASSWORD in backend/.env.");
  const api = new AdminApi(originUrl.origin);
  await api.login(email, password);
  const [existingProducts, existingCategories] = await Promise.all([
    api.request<{ products: { slug: string }[] }>("/api/products"),
    api.request<{ categories: { slug: string }[] }>("/api/categories"),
  ]);
  const existingSlugs = new Set(existingProducts.products.map(p => p.slug));
  const newProducts = selected.filter(product => !existingSlugs.has(product.slug));
  const categorySlugs = new Set(existingCategories.categories.map(c => c.slug));
  const uploadedImages = new Map<string, string>();
  const mediaReportPath = path.resolve(values["media-report"] ?? path.resolve(__dirname, "../catalog/uploaded-images.json"));
  let savedImages: Record<string, string> = {};
  try { savedImages = z.record(slugSchema, z.string().url()).parse(JSON.parse(await readFile(mediaReportPath, "utf8"))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const report: { created: { slug: string; id: string; image: string }[]; skipped: string[] } = { created: [], skipped: selected.filter(p => existingSlugs.has(p.slug)).map(p => p.slug) };
  const reportPath = path.resolve(values.report ?? path.resolve(__dirname, "../catalog/upload-result.json"));
  async function getImage(product: CatalogProduct) {
    const previous = uploadedImages.get(product.slug);
    if (previous) return previous;
    const saved = savedImages[product.slug];
    if (saved && new URL(saved).origin === originUrl.origin && new URL(saved).pathname.startsWith("/api/uploads/")) {
      const response = await fetch(saved, { redirect: "error", signal: AbortSignal.timeout(30_000) });
      if (response.ok && Buffer.from(await response.arrayBuffer()).equals(await readFile(imagePath(product.slug)))) {
        uploadedImages.set(product.slug, saved);
        return saved;
      }
      if (response.status !== 404 && !response.ok) throw new Error(`Saved image check for ${product.slug} returned HTTP ${response.status}.`);
    }
    const image = await api.upload(product);
    uploadedImages.set(product.slug, image);
    savedImages[product.slug] = image;
    await writeFile(mediaReportPath, JSON.stringify(savedImages, null, 2) + "\n");
    return image;
  }
  if (values["stage-media"]) {
    for (const product of catalog.products) {
      await getImage(product);
      console.log(`Image uploaded and verified: ${product.slug}`);
    }
  }
  for (const category of catalog.categories.filter(c => values["stage-media"] || values["refresh-categories"] || newProducts.some(p => p.category === c.slug))) {
    const exists = categorySlugs.has(category.slug);
    if (exists && !values["refresh-categories"]) continue;
    const imageProduct = catalog.products.find(p => p.slug === category.imageSlug)!;
    await api.request(exists ? `/api/categories/${category.slug}` : "/api/categories", exists ? "PUT" : "POST", { slug: category.slug, name: category.name, description: category.description, image: await getImage(imageProduct) });
    categorySlugs.add(category.slug);
    console.log(`Category ${exists ? "updated" : "created"}: ${category.slug}`);
  }
  if (values["stage-media"]) {
    console.log(`Staged ${uploadedImages.size} verified images and ${catalog.categories.length} categories. No product prices or stock were entered.`);
    return;
  }
  for (const product of newProducts) {
    const image = await getImage(product);
    const payload = buildProductPayload(product, inventory[product.slug], image, catalog.brand, values["pending-pricing"]);
    const created = await api.request<{ product: { id: string; slug: string } }>("/api/products", "POST", payload);
    report.created.push({ slug: created.product.slug, id: created.product.id, image });
    // Persist progress immediately so an interrupted upload is reviewable.
    await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
    const stored = await api.request<{ product: { slug: string; name: string; images: string[]; variants: { price: number; stock: number }[] } }>(`/api/products/${product.slug}`);
    if (stored.product.name !== payload.name || !stored.product.images.includes(image) || stored.product.variants[0]?.price !== payload.variants[0].price || stored.product.variants[0]?.stock !== payload.variants[0].stock) {
      throw new Error(`Product verification failed: ${product.slug}. See catalog/upload-result.json for progress.`);
    }
    console.log(`Uploaded and verified: ${product.slug}`);
  }
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`Finished: ${report.created.length} created, ${report.skipped.length} existing products preserved.`);
}

if (require.main === module) {
  main().catch(error => {
    // Avoid printing request bodies, cookies, credentials or connection URLs.
    console.error(error instanceof z.ZodError ? error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("\n") : error instanceof Error ? error.message : "Catalog upload failed.");
    process.exitCode = 1;
  });
}
