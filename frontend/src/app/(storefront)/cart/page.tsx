"use client";

import Link from "next/link";
import { ShoppingBag, X, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCartDetails, useCartStore } from "@/store/cart";
import { couponsApi, ApiClientError } from "@/lib/api";
import { useValidatedCoupon } from "@/lib/useValidatedCoupon";
import { formatPrice, cn, variantLabel } from "@/lib/utils";
import ProductThumb from "@/components/product/ProductThumb";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { buttonVariants } from "@/components/ui/Button";
import Button from "@/components/ui/Button";
import { useHasMounted } from "@/lib/useHasMounted";
import { useProducts } from "@/lib/hooks";
import ProductCard from "@/components/product/ProductCard";
import { useT } from "@/store/locale";

export default function CartPage() {
  const t = useT();
  const { lines, subtotal } = useCartDetails();
  const { data: bestsellers } = useProducts({ sort: "bestselling", limit: 4 });
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const couponCode = useCartStore((s) => s.couponCode);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const mounted = useHasMounted();

  const { coupon, status: couponStatus } = useValidatedCoupon(couponCode);
  const discount = coupon ? Math.round(subtotal * (coupon.percentOff / 100)) : 0;
  // Delivery price is calculated from the selected city at checkout.
  const total = subtotal - discount;

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (applying) return;
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const result = await couponsApi.validate(code);
      if (!result.valid || !result.coupon) { toast.error(t("cart.couponInvalid")); return; }
      applyCoupon(result.coupon.code);
      toast.success(`${result.coupon.label} ${t("cart.couponApplied")}`);
      setCouponInput("");
    } catch (error) { toast.error(error instanceof ApiClientError ? error.message : t("common.requestFailed")); }
    finally { setApplying(false); }
  }

  if (!mounted) return <div className="container-luxe py-24" />;

  if (lines.length === 0) {
    const suggestions = bestsellers;
    return (
      <div className="container-luxe py-20 text-center">
        <ShoppingBag size={40} className="mx-auto text-charcoal/20" />
        <h1 className="mt-6 font-display text-3xl text-charcoal">{t("cart.emptyTitle")}</h1>
        <p className="mt-2 text-sm text-charcoal/50">{t("cart.emptyBody")}</p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}>
          {t("cart.shopCollection")}
        </Link>
        <div className="mt-20">
          <h2 className="mb-8 font-display text-2xl text-charcoal">{t("cart.youMightLike")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {suggestions.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10 sm:py-14">
      <h1 className="font-display text-4xl text-charcoal">{t("cart.title")}</h1>
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-charcoal/8">
          {lines.map(({ product, variant, quantity }) => (
            <div key={variant.id} className="flex gap-5 py-6">
              <Link href={`/product/${product.slug}`} className="block shrink-0">
                <ProductThumb src={product.image} alt={product.name} accent={product.accent} className="h-32 w-24" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/product/${product.slug}`} className="font-display text-lg text-charcoal hover:text-deep-rose">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-charcoal/45">{variantLabel(variant, t("common.giftSet"))}{product.brandLine ? ` · ${product.brandLine}` : ""}</p>
                  </div>
                  <button onClick={() => removeItem(variant.id)} aria-label={t("cart.removeItem")} className="text-charcoal/30 hover:text-wine cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper value={quantity} onChange={(q) => updateQuantity(variant.id, q)} />
                  <span className="font-medium text-charcoal">{formatPrice(variant.price * quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-blush-soft/60 p-6">
          <h2 className="font-display text-xl text-charcoal">{t("cart.orderSummary")}</h2>

          <form onSubmit={handleApplyCoupon} className="mt-5">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-full bg-ivory px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-deep-rose"><Tag size={13} /> {couponCode} {t("cart.couponApplied")}</span>
                <button type="button" onClick={removeCoupon} aria-label={t("cart.removeCoupon")} className="text-charcoal/40 hover:text-wine cursor-pointer"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("cart.couponPlaceholder")}
                  aria-label={t("cart.couponPlaceholder")}
                  className="h-11 min-w-0 flex-1 rounded-full border border-charcoal/15 bg-ivory px-4 text-sm outline-none focus:border-deep-rose"
                />
                <Button type="submit" disabled={applying} variant="outline" size="md">{applying ? t("common.loading") : t("cart.couponApply")}</Button>
              </div>
            )}
            {couponStatus === "loading" && <p role="status" className="mt-2 text-xs">{t("common.loading")}</p>}
            {(couponStatus === "invalid" || couponStatus === "error") && <p role="alert" className="mt-2 text-xs text-wine">{t(couponStatus === "invalid" ? "cart.couponInvalid" : "common.requestFailed")}</p>}
          </form>

          <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-5 text-sm">
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
              <span>{t("checkout.selectCity")}</span>
            </div>
            <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-medium text-charcoal">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
            {t("cart.proceedToCheckout")}
          </Link>
          <Link href="/shop" className="mt-4 block text-center text-xs text-charcoal/50 hover:text-deep-rose">
            {t("cart.continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
