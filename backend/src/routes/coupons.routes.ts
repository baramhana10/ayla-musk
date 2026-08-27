import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import { notFound } from "../utils/ApiError";

const router = Router();

router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const coupons = await prisma.coupon.findMany();
    res.json({ coupons });
  })
);

router.get(
  "/validate/:code",
  asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.findUnique({ where: { code: (req.params.code as string).toUpperCase() } });
    if (!coupon || !coupon.active) return res.json({ valid: false });
    res.json({ valid: true, coupon });
  })
);

const couponSchema = z.object({
  code: z.string().min(2),
  label: z.string().min(1),
  percentOff: z.number().int().min(1).max(100),
  active: z.boolean().default(true),
});

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.upsert({
      where: { code: body.code.toUpperCase() },
      create: { ...body, code: body.code.toUpperCase() },
      update: body,
    });
    res.status(201).json({ coupon });
  })
);

router.delete(
  "/:code",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await prisma.coupon.findUnique({ where: { code: (req.params.code as string).toUpperCase() } });
    if (!existing) throw notFound("Coupon");
    await prisma.coupon.delete({ where: { code: existing.code } });
    res.status(204).send();
  })
);

export default router;
