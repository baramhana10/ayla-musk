import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeProduct } from "../utils/serializers";
import { notFound } from "../utils/ApiError";
import { requireAdmin } from "../middleware/auth";

const router = Router();

const listQuerySchema = z.object({
  department: z.string().optional(),
  category: z.string().optional(),
  scentFamily: z.string().optional(),
  search: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["featured", "bestselling", "price-asc", "price-desc", "rating"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);

    const products = await prisma.product.findMany({
      where: {
        department: query.department,
        categorySlug: query.category,
        scentFamily: query.scentFamily,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search } },
                { shortDescription: { contains: query.search } },
                { scentFamily: { contains: query.search } },
                { lensType: { contains: query.search } },
              ],
            }
          : {}),
      },
      include: { variants: true },
    });

    let results = products.map(serializeProduct);

    if (query.maxPrice) {
      results = results.filter((p) => Math.min(...p.variants.map((v) => v.price)) <= query.maxPrice!);
    }

    switch (query.sort) {
      case "bestselling":
        results.sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.reviewCount - a.reviewCount);
        break;
      case "price-asc":
        results.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
        break;
      case "price-desc":
        results.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        results.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    if (query.limit) results = results.slice(0, query.limit);

    res.json({ products: results });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: (req.params.slug as string) },
      include: { variants: true, reviews: { orderBy: { createdAt: "desc" } } },
    });
    if (!product) throw notFound("Product");
    res.json({ product: serializeProduct(product) });
  })
);

const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional().nullable(),
  sizeMl: z.number().int().min(0).optional().nullable(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0),
});

// No `.default()` on any field here — this schema is reused via `.partial()`
// for PATCH-style updates, and Zod applies defaults even when a key is
// entirely absent from the input, which would silently overwrite existing
// values on partial edits. Defaults for creation are applied explicitly
// in the POST handler below instead.
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  brandLine: z.string().optional().nullable(),
  department: z.enum(["body-care", "perfumes", "lenses"]),
  category: z.string().optional().nullable(),
  accent: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string(),

  // Perfumes
  scentFamily: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  notes: z.object({ top: z.array(z.string()), heart: z.array(z.string()), base: z.array(z.string()) }).optional().nullable(),

  // Body Care
  benefits: z.array(z.string()).optional().nullable(),
  ingredients: z.array(z.string()).optional().nullable(),
  howToUse: z.string().optional().nullable(),
  skinHairType: z.string().optional().nullable(),

  // Contact Lenses
  lensType: z.string().optional().nullable(),
  lensColor: z.string().optional().nullable(),
  diameter: z.string().optional().nullable(),
  baseCurve: z.string().optional().nullable(),
  replacementDuration: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  waterContent: z.string().optional().nullable(),
  prescriptionAvailable: z.boolean().optional(),

  images: z.array(z.string()),
  variants: z.array(variantSchema).min(1),
  featured: z.boolean(),
  bestseller: z.boolean(),
  isNew: z.boolean(),
});

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        brandLine: body.brandLine,
        department: body.department,
        categorySlug: body.category || null,
        accent: body.accent,
        shortDescription: body.shortDescription,
        description: body.description ?? "",
        scentFamily: body.scentFamily,
        gender: body.gender,
        notesTop: body.notes ? JSON.stringify(body.notes.top) : "[]",
        notesHeart: body.notes ? JSON.stringify(body.notes.heart) : "[]",
        notesBase: body.notes ? JSON.stringify(body.notes.base) : "[]",
        benefits: JSON.stringify(body.benefits ?? []),
        ingredients: JSON.stringify(body.ingredients ?? []),
        howToUse: body.howToUse,
        skinHairType: body.skinHairType,
        lensType: body.lensType,
        lensColor: body.lensColor,
        diameter: body.diameter,
        baseCurve: body.baseCurve,
        replacementDuration: body.replacementDuration,
        material: body.material,
        waterContent: body.waterContent,
        prescriptionAvailable: body.prescriptionAvailable ?? false,
        imagesJson: JSON.stringify(body.images ?? []),
        featured: body.featured ?? false,
        bestseller: body.bestseller ?? false,
        isNew: body.isNew ?? false,
        variants: { create: body.variants.map(({ id: _id, ...v }) => v) },
      },
      include: { variants: true },
    });

    res.status(201).json({ product: serializeProduct(product) });
  })
);

router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = productSchema.partial().parse(req.body);
    const existing = await prisma.product.findUnique({ where: { id: (req.params.id as string) }, include: { variants: true } });
    if (!existing) throw notFound("Product");

    if (body.variants) {
      const keepIds = body.variants.map((v) => v.id).filter(Boolean) as string[];
      await prisma.productVariant.deleteMany({ where: { productId: existing.id, id: { notIn: keepIds } } });
      for (const v of body.variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { label: v.label, sizeMl: v.sizeMl, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock },
          });
        } else {
          const { id: _id, ...rest } = v;
          await prisma.productVariant.create({ data: { ...rest, productId: existing.id } });
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        brandLine: body.brandLine,
        department: body.department,
        categorySlug: body.category !== undefined ? body.category || null : undefined,
        accent: body.accent,
        shortDescription: body.shortDescription,
        description: body.description,
        scentFamily: body.scentFamily,
        gender: body.gender,
        notesTop: body.notes ? JSON.stringify(body.notes.top) : undefined,
        notesHeart: body.notes ? JSON.stringify(body.notes.heart) : undefined,
        notesBase: body.notes ? JSON.stringify(body.notes.base) : undefined,
        benefits: body.benefits ? JSON.stringify(body.benefits) : undefined,
        ingredients: body.ingredients ? JSON.stringify(body.ingredients) : undefined,
        howToUse: body.howToUse,
        skinHairType: body.skinHairType,
        lensType: body.lensType,
        lensColor: body.lensColor,
        diameter: body.diameter,
        baseCurve: body.baseCurve,
        replacementDuration: body.replacementDuration,
        material: body.material,
        waterContent: body.waterContent,
        prescriptionAvailable: body.prescriptionAvailable,
        imagesJson: body.images ? JSON.stringify(body.images) : undefined,
        featured: body.featured,
        bestseller: body.bestseller,
        isNew: body.isNew,
      },
      include: { variants: true },
    });

    res.json({ product: serializeProduct(product) });
  })
);

router.post(
  "/:id/duplicate",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await prisma.product.findUnique({ where: { id: (req.params.id as string) }, include: { variants: true } });
    if (!existing) throw notFound("Product");

    let slug = `${existing.slug}-copy`;
    let n = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${existing.slug}-copy-${n}`;
    }

    const product = await prisma.product.create({
      data: {
        name: `${existing.name} (Copy)`,
        slug,
        brandLine: existing.brandLine,
        department: existing.department,
        categorySlug: existing.categorySlug,
        accent: existing.accent,
        shortDescription: existing.shortDescription,
        description: existing.description,
        scentFamily: existing.scentFamily,
        gender: existing.gender,
        notesTop: existing.notesTop,
        notesHeart: existing.notesHeart,
        notesBase: existing.notesBase,
        benefits: existing.benefits,
        ingredients: existing.ingredients,
        howToUse: existing.howToUse,
        skinHairType: existing.skinHairType,
        lensType: existing.lensType,
        lensColor: existing.lensColor,
        diameter: existing.diameter,
        baseCurve: existing.baseCurve,
        replacementDuration: existing.replacementDuration,
        material: existing.material,
        waterContent: existing.waterContent,
        prescriptionAvailable: existing.prescriptionAvailable,
        imagesJson: existing.imagesJson,
        featured: false,
        bestseller: false,
        isNew: true,
        variants: {
          create: existing.variants.map((v) => ({
            label: v.label,
            sizeMl: v.sizeMl,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
          })),
        },
      },
      include: { variants: true },
    });

    res.status(201).json({ product: serializeProduct(product) });
  })
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: (req.params.id as string) } });
    res.status(204).send();
  })
);

export default router;
