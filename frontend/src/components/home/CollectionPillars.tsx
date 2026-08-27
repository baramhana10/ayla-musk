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
 * The house's three departments, in a clear, balanced hierarchy rather than
 * a catalogue mosaic — Body Care, Perfumes, Contact Lenses. Reads straight
 * from the shared `DEPARTMENTS` registry so this stays in lockstep with the
 * shop filter, the admin form, and every other place the 3 departments are
 * listed, rather than keeping its own separate copy of the same 3 rows.
 */
export default function CollectionPillars() {
  const t = useT();

  return (
    <section className="bg-[var(--hw-white)] py-24 sm:py-32">
      <div className="container-luxe">
        <SectionHeading eyebrow={t("pillars.eyebrow")} index="01" title={t("pillars.title")} description={t("pillars.description")} tone="warm" />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {DEPARTMENTS.map((d, i) => (
            <Link key={d.slug} href={departmentHref(d.slug)} className="block">
              <motion.div
                initial={{ opacity: 0, y: 34, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85, delay: i * 0.12, ease: easeLuxe }}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[1.75rem] sm:aspect-[4/5]"
              >
                <Image
                  src={d.image}
                  alt={t(d.titleKey)}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--hw-espresso)]/85 via-[var(--hw-espresso)]/10 to-transparent transition-opacity duration-700 group-hover:from-[var(--hw-espresso)]/92" />

                {/* Tan frame that insets on hover — an expensive, quiet gesture. */}
                <span className="pointer-events-none absolute inset-3 border border-[var(--hw-tan-light)]/0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:inset-4 group-hover:border-[var(--hw-tan-light)]/50" />

                <div className="relative flex items-end justify-between gap-3 p-6 sm:p-7">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--hw-tan-light)]/90">
                      {String(i + 1).padStart(2, "0")} — {t(d.tagKey)}
                    </p>
                    <p className="mt-2 font-display text-2xl leading-tight text-[var(--hw-cream)] sm:text-[1.75rem]">
                      {t(d.titleKey)}
                    </p>
                    <p className="mt-2 max-w-[22ch] text-[12.5px] leading-relaxed text-[var(--hw-cream)]/70">
                      {t(d.descriptionKey)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-[var(--hw-tan-light)]">
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
    </section>
  );
}
