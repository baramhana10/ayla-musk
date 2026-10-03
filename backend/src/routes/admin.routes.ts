import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAdmin);

// Visitor counts describe anonymous browsers, independent of guest orders.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const now = Date.now();
    const [orders, products, visitorCount, visitors24Hours, visitors7Days] = await Promise.all([
      prisma.order.findMany(),
      prisma.product.findMany({ include: { variants: true } }),
      prisma.siteVisitor.count(),
      prisma.siteVisitor.count({ where: { lastSeen: { gte: new Date(now - 24 * 60 * 60 * 1000) } } }),
      prisma.siteVisitor.count({ where: { lastSeen: { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= 10)).length;

    res.json({
      revenue,
      orderCount: orders.length,
      avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
      lowStockCount: lowStock,
      visitorCount,
      visitors24Hours,
      visitors7Days,
    });
  })
);

export default router;
