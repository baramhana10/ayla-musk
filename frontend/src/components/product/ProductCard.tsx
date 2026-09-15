"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { minPrice, maxCompareAt } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * Restrained on purpose. In a grid of eight, per-card decoration compounds into
 * noise — so the still state is a photograph, a rule and set type. On touch
 * screens the buying controls remain visible: hover-only commerce controls
 * create a dead end for the people most likely to browse on mobile.
 */
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const isSaved = useWishlistStore((s) => s.isSaved(product.slug));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const flashAdded = useUIStore((s) => s.flashAdded);
  const t = useT();

  const price = minPrice(product);
  const compareAt = maxCompareAt(product);
  const defaultVariant = product.variants[0];
  const image = product.images[0];
  const secondary = product.images[1] ?? image;

  function handleQuickAdd() {
    addItem(product, defaultVariant, 1);
    flashAdded(product.name);
    toast.success(`${product.name} ${t("product.addedToBag")}`);
  }

  function handleWishlist() {
    toggleWishlist(product.slug);
    toast(isSaved ? t("product.wishlistRemoved") : t("product.wishlistAdded"), {
      icon: <Heart size={14} className={isSaved ? "" : "fill-deep-rose text-deep-rose"} />,
    });
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.75, delay: (index % 4) * 0.09, ease: easeLuxe }}
      className="group relative"
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          className="block overflow-hidden rounded-[1.35rem] focus-visible:rounded-[1.35rem]"
        >
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
          {image ? (
            <>
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-0"
              />
              {/* Second frame beneath, cross-dissolving on hover — the catalogue
                  gesture, and free if the product has a second shot. */}
              <Image
                src={secondary}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="scale-[1.06] object-cover opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 50% 30%, ${product.accent}44, transparent 68%)` }}
            />
          )}

          {/* Index — the only mark visible at rest. */}
          <span className="absolute start-4 top-4 z-10 font-display text-[11px] tracking-[0.2em] text-ivory mix-blend-difference">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="absolute end-4 top-4 z-10 flex flex-col items-end gap-1.5">
            {product.bestseller && (
              <span className="bg-noir/70 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-champagne-light backdrop-blur">
                {t("product.bestseller")}
              </span>
            )}
            {product.isNew && (
              <span className="bg-ivory/85 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-charcoal backdrop-blur">
                {t("product.new")}
              </span>
            )}
            {compareAt && (
              <span className="bg-wine px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-ivory">
                −{Math.round(100 - (price / compareAt) * 100)}%
              </span>
            )}
          </div>

        </div>
        </Link>

        {/* The controls are siblings of the product link, avoiding nested
            interactive elements while retaining the visual overlay. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-stretch translate-y-0 opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-noir/90 px-3 py-3 text-[9.5px] uppercase tracking-[0.18em] text-ivory backdrop-blur transition-colors hover:bg-deep-rose"
          >
            <Plus size={12} /> {t("product.quickAdd")}
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isSaved ? t("product.removeFromWishlist") : t("product.addToWishlist")}
            className="flex min-h-11 w-12 cursor-pointer items-center justify-center border-s border-ivory/15 bg-noir/90 text-ivory backdrop-blur transition-colors hover:bg-deep-rose"
          >
            <Heart size={13} className={cn(isSaved && "fill-champagne-light text-champagne-light")} />
          </button>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="mt-5 block rounded-sm">
        <div>
          <div className="flex items-baseline justify-between gap-3 border-b border-charcoal/10 pb-2.5">
            <h3 className="font-display text-[17px] leading-snug text-charcoal transition-colors duration-500 group-hover:text-deep-rose">
              {product.name}
            </h3>
            <span className="shrink-0 text-[13px] tabular-nums text-charcoal/80">
              {formatPrice(price)}
              {compareAt && (
                <span className="ms-1.5 text-[11px] text-charcoal/30 line-through">{formatPrice(compareAt)}</span>
              )}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <p className="text-[9.5px] uppercase tracking-[0.2em] text-charcoal/40">
              {product.brandLine ?? product.scentFamily}
            </p>
            <Rating value={product.rating} size={11} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
