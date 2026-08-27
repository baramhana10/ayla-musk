"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { editorial } from "@/lib/images";
import { useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * The full-bleed break in the page. Everything else is contained by
 * `.container-luxe`; this one runs edge to edge and goes deep espresso, which
 * is what gives the homepage a second act instead of one continuous scroll
 * of white cards. The photograph is parallaxed a little behind its frame so
 * the section has depth as it passes.
 */
export default function EditorialBanner() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = useT();
  const steps = [
    { n: "01", t: t("editorial.step1t"), d: t("editorial.step1d") },
    { n: "02", t: t("editorial.step2t"), d: t("editorial.step2d") },
    { n: "03", t: t("editorial.step3t"), d: t("editorial.step3d") },
  ];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shift = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imageY = prefersReducedMotion ? "0%" : shift;

  return (
    <section ref={ref} className="grain-warm relative isolate overflow-hidden bg-[var(--hw-espresso)] py-24 text-[var(--hw-cream)] sm:py-32">
      <motion.div style={{ y: imageY }} className="absolute inset-0 -z-10 scale-110">
        <Image
          src={editorial.dropperEucalyptus}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--hw-espresso)] via-[var(--hw-espresso)]/92 to-[var(--hw-espresso)]/50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--hw-espresso)] via-transparent to-[var(--hw-espresso)]/70" />

      <div className="container-luxe grid grid-cols-1 gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.95, ease: easeLuxe }}
        >
          <div className="flex items-center gap-4">
            <span className="font-display text-[13px] text-[var(--hw-tan-light)]">03</span>
            <span className="h-px w-10 bg-[var(--hw-tan)]/45" />
            <span className="text-[10px] uppercase tracking-[0.36em] text-[var(--hw-cream)]/55">{t("editorial.eyebrow")}</span>
          </div>

          <blockquote className="mt-8 max-w-[20ch] font-display text-[2.4rem] leading-[1.04] sm:text-[3.4rem] lg:text-[4.2rem]">
            {t("editorial.quoteA")} <em className="text-bronze italic">{t("editorial.quoteEm")}</em> {t("editorial.quoteB")}
          </blockquote>

          <p className="mt-8 max-w-md text-[15px] leading-[1.8] text-[var(--hw-cream)]/60">
            {t("editorial.paragraph")}
          </p>

          <Link
            href="/shop?category=musk-oil"
            className="group relative mt-11 inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-[var(--hw-tan)]/60 px-10 text-[12px] uppercase tracking-[0.18em] text-[var(--hw-tan-light)] transition-colors duration-500 hover:text-[var(--hw-espresso)]"
          >
            <span className="absolute inset-0 -z-10 translate-y-full bg-gradient-to-t from-[var(--hw-tan)] to-[var(--hw-tan-light)] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
            <span className="relative">{t("editorial.cta")}</span>
          </Link>
        </motion.div>

        {/* Steps as a hairline-ruled table — set like a recipe card. */}
        <div className="lg:pb-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: easeLuxe }}
              className="flex gap-6 border-t border-[var(--hw-cream)]/12 py-6 last:border-b"
            >
              <span className="font-display text-[13px] text-[var(--hw-tan-light)]">{s.n}</span>
              <div>
                <p className="font-display text-xl text-[var(--hw-cream)]">{s.t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--hw-cream)]/45">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
