import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { attachUser, requireAdmin } from "../middleware/auth";
import { badRequest, notFound } from "../utils/ApiError";

const router = Router();

function firstImage(imagesJson: string): string | undefined {
  try {
    const parsed = JSON.parse(imagesJson);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : undefined;
  } catch {
    return undefined;
  }
}

function serializeOrder(order: any) {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    couponCode: order.couponCode,
    shippingAddress: {
      fullName: order.fullName,
      phone: order.phone,
      city: order.city,
      address: order.address,
    },
    items: order.items.map((i: any) => ({
      productSlug: i.product.slug,
      productName: i.productName,
      accent: i.accent,
      image: i.image ?? undefined,
      label: i.label ?? undefined,
      sizeMl: i.sizeMl ?? undefined,
      quantity: i.quantity,
      price: i.price,
    })),
  };
}

const createOrderSchema = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1) })).min(1),
  couponCode: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(7),
    city: z.string().min(1),
    address: z.string().min(4),
  }),
});

router.post(
  "/",
  attachUser,
  asyncHandler(async (req, res) => {
    const body = createOrderSchema.parse(req.body);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: body.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    if (variants.length !== body.items.length) throw badRequest("One or more items are no longer available");

    let subtotal = 0;
    const lineData = body.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.stock < item.quantity) {
        const variantLabel = variant.label ?? (variant.sizeMl ? `${variant.sizeMl}ml` : "");
        throw badRequest(`${variant.product.name} (${variantLabel}) is out of stock`);
      }
      subtotal += variant.price * item.quantity;
      return { variant, quantity: item.quantity };
    });

    let discount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode.toUpperCase() } });
      if (coupon && coupon.active) {
        discount = Math.round(subtotal * (coupon.percentOff / 100));
        couponCode = coupon.code;
      }
    }

    const shipping = subtotal >= 7500 ? 0 : 650;
    const total = subtotal - discount + shipping;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.user?.userId,
          subtotal,
          discount,
          shipping,
          total,
          couponCode,
          ...body.shippingAddress,
          items: {
            create: lineData.map(({ variant, quantity }) => ({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              accent: variant.product.accent,
              image: firstImage(variant.product.imagesJson),
              label: variant.label,
              sizeMl: variant.sizeMl,
              quantity,
              price: variant.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const { variant, quantity } of lineData) {
        await tx.productVariant.update({ where: { id: variant.id }, data: { stock: { decrement: quantity } } });
      }

      return created;
    });

    res.status(201).json({ order: serializeOrder(order) });
  })
);

// Admin-only: there is no customer account system, so the only legitimate
// consumer of "all orders" is the admin dashboard.
router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders: orders.map(serializeOrder) });
  })
);

// Deliberately unauthenticated: guest checkout has no account to check
// against, so the order's own unguessable id is what scopes access to this
// one order confirmation — the same pattern most guest-checkout storefronts
// use for an order-status link. Admins reach the same data through the
// dashboard, which also hits this route.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: (req.params.id as string) },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw notFound("Order");
    res.json({ order: serializeOrder(order) });
  })
);

const statusSchema = z.object({ status: z.enum(["processing", "shipped", "delivered"]) });

router.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: (req.params.id as string) },
      data: { status },
      include: { items: { include: { product: true } } },
    });
    res.json({ order: serializeOrder(order) });
  })
);

export default router;
