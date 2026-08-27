"use client";

import { useState } from "react";
import { Heart, ShoppingBag, Check, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { formatPrice, cn, variantLabel } from "@/lib/utils";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useT } from "@/store/locale";

export default function AddToCartPanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const flashAdded = useUIStore((s) => s.flashAdded);
  const isSaved = useWishlistStore((s) => s.isSaved(product.slug));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const t = useT();

  const variant = product.variants.find((v) => v.id === variantId)!;
  const inStock = variant.stock > 0;

  function handleAdd() {
    addItem(product, variant, quantity);
    flashAdded(product.name);
    toast.success(`${product.name} (${variantLabel(variant, t("common.giftSet"))}) ${t("product.addedToBag")}`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
          {t("product.size")} {variant.sizeMl ? `— ${variant.sizeMl}ml` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              className={cn(
                "rounded-full border px-4 py-2.5 text-sm transition-colors cursor-pointer",
                v.id === variantId ? "border-deep-rose bg-deep-rose text-ivory" : "border-charcoal/20 text-charcoal/70 hover:border-deep-rose"
              )}
            >
              {variantLabel(v, t("common.giftSet"))} — {formatPrice(v.price)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-4xl font-bold tracking-tight text-price sm:text-5xl">
            {formatPrice(variant.price)}
          </span>
          {variant.compareAtPrice && (
            <span className="text-sm text-charcoal/35 line-through">{formatPrice(variant.compareAtPrice)}</span>
          )}
        </div>
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            inStock ? "bg-green-700/10 text-green-700" : "bg-wine/10 text-wine"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", inStock ? "bg-green-700" : "bg-wine")} />
          {inStock ? t("product.inStock") : t("product.outOfStock")}
        </span>
      </div>

      {/* Quantity and wishlist are secondary controls, grouped compactly at
          matching height; Add to Bag stands alone as the one unmistakable
          primary action, full width, so the two roles never fight for the
          same row the way an uneven three-up layout would. */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} size="lg" />
          <button
            onClick={() => {
              toggleWishlist(product.slug);
              toast(isSaved ? t("product.wishlistRemoved") : t("product.wishlistAdded"));
            }}
            aria-label={isSaved ? t("product.removeFromWishlist") : t("product.addToWishlist")}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-charcoal/20 text-charcoal/60 transition-colors hover:border-deep-rose hover:text-deep-rose cursor-pointer"
          >
            <Heart size={18} className={cn(isSaved && "fill-deep-rose text-deep-rose")} />
          </button>
        </div>
        <Button size="lg" className="w-full" disabled={!inStock} onClick={handleAdd}>
          {justAdded ? (
            <>
              <Check size={16} /> {t("product.addedToBagShort")}
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> {t("product.addToBag")}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-charcoal/10 pt-6 sm:grid-cols-3">
        {[
          { icon: Truck, label: t("product.freeShipping") },
          { icon: RotateCcw, label: t("product.returns30") },
          { icon: ShieldCheck, label: t("product.crueltyFree") },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-xs text-charcoal/55">
            <f.icon size={15} className="text-deep-rose shrink-0" />
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}
