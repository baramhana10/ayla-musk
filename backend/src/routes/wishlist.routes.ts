import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { serializeProduct } from "../utils/serializers";
import { notFound } from "../utils/ApiError";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.userId },
      include: { product: { include: { variants: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products: items.map((i) => serializeProduct(i.product)) });
  })
);

router.post(
  "/:productId",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: (req.params.productId as string) } });
    if (!product) throw notFound("Product");

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId: product.id } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ saved: false });
    }
    await prisma.wishlistItem.create({ data: { userId: req.user!.userId, productId: product.id } });
    res.json({ saved: true });
  })
);

router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.userId, productId: (req.params.productId as string) } });
    res.status(204).send();
  })
);

export default router;
