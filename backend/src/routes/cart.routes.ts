import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { notFound } from "../utils/ApiError";
import { serializeProduct } from "../utils/serializers";

const router = Router();
router.use(requireAuth);

async function getCartPayload(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { variants: true } }, variant: true },
    orderBy: { createdAt: "asc" },
  });
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: serializeProduct(item.product),
    variant: { id: item.variant.id, sizeMl: item.variant.sizeMl, price: item.variant.price, stock: item.variant.stock },
  }));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ items: await getCartPayload(req.user!.userId) });
  })
);

const addSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const body = addSchema.parse(req.body);
    const variant = await prisma.productVariant.findUnique({ where: { id: body.variantId } });
    if (!variant) throw notFound("Variant");

    const existing = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId: req.user!.userId, variantId: body.variantId } },
    });

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + body.quantity } });
    } else {
      await prisma.cartItem.create({
        data: { userId: req.user!.userId, productId: body.productId, variantId: body.variantId, quantity: body.quantity },
      });
    }

    res.status(201).json({ items: await getCartPayload(req.user!.userId) });
  })
);

const updateSchema = z.object({ quantity: z.number().int().min(0) });

router.patch(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const { quantity } = updateSchema.parse(req.body);
    const item = await prisma.cartItem.findFirst({ where: { id: (req.params.id as string), userId: req.user!.userId } });
    if (!item) throw notFound("Cart item");

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    }
    res.json({ items: await getCartPayload(req.user!.userId) });
  })
);

router.delete(
  "/items/:id",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({ where: { id: (req.params.id as string), userId: req.user!.userId } });
    res.json({ items: await getCartPayload(req.user!.userId) });
  })
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
    res.status(204).send();
  })
);

export default router;
