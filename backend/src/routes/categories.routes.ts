import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeCategory } from "../utils/serializers";
import { notFound } from "../utils/ApiError";
import { requireAdmin } from "../middleware/auth";
import { slugify } from "../utils/slugify";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany();
    res.json({ categories: categories.map(serializeCategory) });
  })
);

// No `.default()` here — reused via `.partial()` for updates, and Zod
// applies defaults even when a key is absent, which would silently blank
// out fields on a partial edit (see products.routes.ts for the same fix).
const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  image: z.string().min(1),
  slug: z.string().optional(),
});

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = categorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: { slug: body.slug || slugify(body.name), name: body.name, description: body.description ?? "", image: body.image },
    });
    res.status(201).json({ category: serializeCategory(category) });
  })
);

router.put(
  "/:slug",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = categorySchema.partial().parse(req.body);
    const existing = await prisma.category.findUnique({ where: { slug: (req.params.slug as string) } });
    if (!existing) throw notFound("Category");
    const category = await prisma.category.update({
      where: { slug: (req.params.slug as string) },
      data: { name: body.name, description: body.description, image: body.image },
    });
    res.json({ category: serializeCategory(category) });
  })
);

router.delete(
  "/:slug",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { slug: (req.params.slug as string) } });
    res.status(204).send();
  })
);

export default router;
