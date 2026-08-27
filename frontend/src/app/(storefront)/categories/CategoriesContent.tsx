"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/store/locale";
import { DEPARTMENTS, departmentHref } from "@/lib/departments";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * The dedicated categories landing page — the same 3 departments as the
 * homepage's CollectionPillars, read from the same shared registry, but set
 * in the site's standing ivory/charcoal/champagne chrome rather than the
 * homepage's warm-brown reskin, since this page is general site navigation
 * like /shop, not part of the homepage's own scoped identity.
 */
export default function CategoriesContent() {
  const t = useT();

  return (
    <div className="container-luxe py-14 sm:py-20">
      <SectionHeading eyebrow={t("pillars.eyebrow")} title={t("pillars.title")} description={t("pillars.description")} />

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {DEPARTMENTS.map((d, i) => (
          <Link key={d.slug} href={departmentHref(d.slug)} className="block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: easeLuxe }}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl"
            >
              <Image
                src={d.image}
                alt={t(d.titleKey)}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/88 via-noir/15 to-transparent transition-opacity duration-700 group-hover:from-noir/94" />
              <span className="pointer-events-none absolute inset-3 border border-champagne-light/0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:inset-4 group-hover:border-champagne-light/40" />

              <div className="relative flex items-end justify-between gap-3 p-6 sm:p-7">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-light/85">
                    {String(i + 1).padStart(2, "0")} — {t(d.tagKey)}
                  </p>
                  <p className="mt-2 font-display text-2xl leading-tight text-ivory sm:text-[1.75rem]">{t(d.titleKey)}</p>
                  <p className="mt-2 max-w-[24ch] text-[12.5px] leading-relaxed text-ivory/70">{t(d.descriptionKey)}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-champagne-light">
                    {t(d.ctaKey)}
                    <ArrowUpRight size={13} className="rtl:-scale-x-100" />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
