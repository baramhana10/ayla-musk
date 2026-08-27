"use client";

import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/store/locale";

export default function RelatedProducts({ products }: { products: Product[] }) {
  const t = useT();
  if (!products.length) return null;
  return (
    <section className="container-luxe py-20 sm:py-24">
      <SectionHeading eyebrow={t("product.youMayAlsoLove")} title={t("product.completeRitual")} />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
