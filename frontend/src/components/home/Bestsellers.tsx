"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "@/lib/hooks";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { useT, useLocale } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * Laid out as an editorial index rather than a centred grid: the heading holds
 * the left column, the "view all" link sits opposite it on the same baseline,
 * and a hairline runs between them. The products then hang off that structure.
 */
export default function Bestsellers() {
  const { data: bestsellers, loading } = useProducts({ sort: "bestselling", limit: 8 });
  const t = useT();
  const locale = useLocale();
  const ArrowIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-[var(--hw-cream)] py-24 sm:py-32">
      <div className="container-luxe">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.85, ease: easeLuxe }}
        className="flex flex-col gap-8 border-b border-[var(--hw-line)] pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-4">
            <span className="font-display text-[13px] text-[var(--hw-brown-light)]">02</span>
            <span className="h-px w-10 bg-[var(--hw-line)]" />
            <span className="text-[10px] uppercase tracking-[0.36em] text-[var(--hw-brown)]/70">
              {t("bestsellers.eyebrow")}
            </span>
          </div>
          <h2 className="mt-5 max-w-xl font-display text-[2.1rem] leading-[1.06] text-[var(--hw-espresso)] sm:text-[2.9rem] md:text-[3.4rem]">
            {t("bestsellers.titleA")} <em className="italic text-bronze not-italic">{t("bestsellers.titleEm")}</em> {t("bestsellers.titleB")}
          </h2>
        </div>

        <Link
          href="/shop"
          className="group inline-flex shrink-0 items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--hw-brown)] transition-colors hover:text-[var(--hw-espresso)]"
        >
          <span className="link-draw">{t("bestsellers.allProducts")}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hw-line)] transition-all duration-500 group-hover:border-[var(--hw-brown-deep)] group-hover:bg-[var(--hw-brown-deep)] group-hover:text-[var(--hw-cream)]">
            <ArrowIcon size={14} className="transition-transform duration-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </Link>
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      </div>
    </section>
  );
}
