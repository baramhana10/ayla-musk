"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/lib/types";

export interface CartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandLine?: string;
  accent: string;
  image?: string;
  label?: string;
  sizeMl?: number;
  price: number;
  compareAtPrice?: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === variant.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.variantId === variant.id ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          const newLine: CartLine = {
            variantId: variant.id,
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            brandLine: product.brandLine,
            accent: product.accent,
            image: product.images[0],
            label: variant.label,
            sizeMl: variant.sizeMl,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            quantity,
          };
          return { lines: [...state.lines, newLine] };
        }),
      removeItem: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: quantity <= 0
            ? state.lines.filter((l) => l.variantId !== variantId)
            : state.lines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
        })),
      applyCoupon: (code) => set({ couponCode: code.toUpperCase() }),
      removeCoupon: () => set({ couponCode: null }),
      clear: () => set({ lines: [], couponCode: null }),
    }),
    { name: "ayla-cart-v2" }
  )
);

export function useCartDetails() {
  const lines = useCartStore((s) => s.lines);

  const resolved = lines.map((l) => ({
    product: {
      id: l.productId,
      slug: l.productSlug,
      name: l.productName,
      brandLine: l.brandLine,
      accent: l.accent,
      image: l.image,
    },
    variant: {
      id: l.variantId,
      label: l.label,
      sizeMl: l.sizeMl,
      price: l.price,
      compareAtPrice: l.compareAtPrice,
    },
    quantity: l.quantity,
  }));

  const subtotal = resolved.reduce((sum, l) => sum + l.variant.price * l.quantity, 0);
  const count = resolved.reduce((sum, l) => sum + l.quantity, 0);
  return { lines: resolved, subtotal, count };
}

export const COUPONS: Record<string, { label: string; percentOff: number }> = {
  AYLA10: { label: "10% off your order", percentOff: 10 },
  WELCOME15: { label: "15% off for new clients", percentOff: 15 },
};
