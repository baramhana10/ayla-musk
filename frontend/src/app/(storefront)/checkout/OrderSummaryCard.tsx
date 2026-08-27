"use client";

import { formatPrice, variantLabel } from "@/lib/utils";
import ProductThumb from "@/components/product/ProductThumb";
import type { useCartDetails } from "@/store/cart";
import { useT } from "@/store/locale";

export default function OrderSummaryCard({
  lines,
  subtotal,
  discount,
  shipping,
  total,
}: {
  lines: ReturnType<typeof useCartDetails>["lines"];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}) {
  const t = useT();
  return (
    <div className="h-fit rounded-2xl bg-blush-soft/60 p-6">
      <h2 className="font-display text-lg text-charcoal">{t("cart.orderSummary")}</h2>
      <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pe-1">
        {lines.map(({ product, variant, quantity }) => (
          <div key={variant.id} className="flex gap-3">
            <div className="relative h-16 w-12 shrink-0">
              <ProductThumb src={product.image} alt={product.name} accent={product.accent} className="h-16 w-12" />
              <span className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-[10px] text-ivory">
                {quantity}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="font-display text-sm text-charcoal">{product.name}</p>
                <p className="text-[11px] text-charcoal/45">{variantLabel(variant, t("common.giftSet"))}</p>
              </div>
              <span className="text-sm text-charcoal/70">{formatPrice(variant.price * quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2.5 border-t border-charcoal/10 pt-5 text-sm">
        <div className="flex justify-between text-charcoal/60">
          <span>{t("cart.subtotal")}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-deep-rose">
            <span>{t("cart.discount")}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-charcoal/60">
          <span>{t("cart.shipping")}</span>
          <span>{shipping === 0 ? t("common.free") : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-medium text-charcoal">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
