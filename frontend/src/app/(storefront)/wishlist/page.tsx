"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useProducts } from "@/lib/hooks";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { buttonVariants } from "@/components/ui/Button";
import { useHasMounted } from "@/lib/useHasMounted";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";

export default function WishlistPage() {
  const slugs = useWishlistStore((s) => s.slugs);
  const mounted = useHasMounted();
  const { data: products, loading } = useProducts();
  const saved = products.filter((p) => slugs.includes(p.slug));
  const t = useT();

  if (!mounted) return <div className="container-luxe py-24" />;

  return (
    <div className="container-luxe py-10 sm:py-14">
      <div className="text-center">
        <h1 className="font-display text-4xl text-charcoal">{t("wishlist.title")}</h1>
        <p className="mt-2 text-sm text-charcoal/50">{saved.length} {saved.length === 1 ? t("wishlist.savedScent") : t("wishlist.savedScents")}</p>
      </div>

      {loading ? (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 py-16 text-center">
          <Heart size={36} className="text-charcoal/20" />
          <p className="text-sm text-charcoal/50">{t("wishlist.emptyBody")}</p>
          <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
            {t("wishlist.exploreCollection")}
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
