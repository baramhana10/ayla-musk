"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useCartDetails, useCartStore } from "@/store/cart";
import { formatPrice, variantLabel } from "@/lib/utils";
import ProductThumb from "@/components/product/ProductThumb";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { buttonVariants } from "@/components/ui/Button";
import { useHasMounted } from "@/lib/useHasMounted";
import { useT, useLocale } from "@/store/locale";

export default function CartDrawer() {
  const t = useT();
  const locale = useLocale();
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const { lines, subtotal } = useCartDetails();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useHasMounted();
  const off = locale === "ar" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: off }}
            animate={{ x: 0 }}
            exit={{ x: off }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-ivory shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <h2 className="font-display text-xl text-charcoal">
                {t("cart.yourBag")} {mounted && lines.length > 0 && `(${lines.length})`}
              </h2>
              <button onClick={() => setOpen(false)} aria-label={t("common.close")} className="text-charcoal/50 hover:text-charcoal cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {!mounted || lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag size={36} className="text-charcoal/20" />
                <p className="text-sm text-charcoal/50">{t("cart.bagEmpty")}</p>
                <Link href="/shop" onClick={() => setOpen(false)} className={buttonVariants()}>
                  {t("cart.discoverCollection")}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="flex flex-col divide-y divide-charcoal/8">
                    {lines.map(({ product, variant, quantity }) => (
                      <div key={variant.id} className="flex gap-4 py-5">
                        <ProductThumb src={product.image} alt={product.name} accent={product.accent} className="h-24 w-20 shrink-0" />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link href={`/product/${product.slug}`} onClick={() => setOpen(false)} className="font-display text-sm text-charcoal hover:text-deep-rose">
                                {product.name}
                              </Link>
                              <button onClick={() => removeItem(variant.id)} className="text-charcoal/30 hover:text-wine cursor-pointer">
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-charcoal/45">{variantLabel(variant, t("common.giftSet"))}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <QuantityStepper value={quantity} onChange={(q) => updateQuantity(variant.id, q)} className="scale-90 origin-start" />
                            <span className="text-sm font-medium text-charcoal">{formatPrice(variant.price * quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-charcoal/10 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-charcoal/60">
                    <span>{t("cart.subtotal")}</span>
                    <span className="text-base font-medium text-charcoal">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-[11px] text-charcoal/40">{t("cart.shippingTaxes")}</p>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ size: "lg", className: "w-full" })}
                  >
                    {t("cart.checkout")} — {formatPrice(subtotal)}
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-xs text-charcoal/50 hover:text-deep-rose underline underline-offset-4">
                    {t("cart.viewFullBag")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
