import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeReview } from "../utils/serializers";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { notFound } from "../utils/ApiError";

const router = Router();

router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const reviews = await prisma.review.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      reviews: reviews.map((r) => ({ ...serializeReview(r), productId: r.productId, productName: r.product.name })),
    });
  })
);

router.get(
  "/product/:productId",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { productId: (req.params.productId as string) },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reviews: reviews.map(serializeReview) });
  })
);

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

router.post(
  "/product/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: (req.params.productId as string) } });
    if (!product) throw notFound("Product");

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const purchased = await prisma.orderItem.findFirst({
      where: { productId: product.id, order: { userId: req.user!.userId } },
    });

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: req.user!.userId,
        author: user?.name ?? "Anonymous",
        rating: data.rating,
        title: data.title,
        body: data.body,
        verified: Boolean(purchased),
      },
    });

    const agg = await prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true });
    await prisma.product.update({
      where: { id: product.id },
      data: { rating: agg._avg.rating ?? data.rating, reviewCount: agg._count },
    });

    res.status(201).json({ review: serializeReview(review) });
  })
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: (req.params.id as string) } });
    if (!review) throw notFound("Review");
    await prisma.review.delete({ where: { id: review.id } });

    const agg = await prisma.review.aggregate({ where: { productId: review.productId }, _avg: { rating: true }, _count: true });
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });

    res.status(204).send();
  })
);

export default router;
