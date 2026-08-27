import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAdmin);

// No customer-account concept on this storefront (guest checkout only), so
// stats/management here cover orders and stock only — not a customer list.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [orders, products] = await Promise.all([
      prisma.order.findMany(),
      prisma.product.findMany({ include: { variants: true } }),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= 10)).length;

    res.json({
      revenue,
      orderCount: orders.length,
      avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
      lowStockCount: lowStock,
    });
  })
);

export default router;
