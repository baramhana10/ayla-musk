"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * The homepage's one deliberate break from the warm cream identity. Black
 * Friday is a noir-and-gold moment by nature, and the site already has that
 * exact vocabulary (.text-gold, .grain, .rule-gold) built for the non-home
 * routes — so this section borrows it wholesale instead of inventing a third
 * palette. No pricing or percentages live here; it's styled for the event,
 * the markdown logic is wired in separately.
 */
export default function BlackFridayBanner() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = useT();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.15, 0.9]);

  const marqueeItems = Array.from({ length: 10 }, () => t("blackFriday.marquee"));

  return (
    <section ref={ref} className="grain relative isolate overflow-hidden bg-noir py-24 text-ivory sm:py-32">
      {/* Ember glow — the one spot of warmth in an otherwise black field. */}
      <motion.div
        aria-hidden="true"
        style={{ scale: prefersReducedMotion ? 1 : glowScale }}
        className="absolute left-1/2 top-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.22),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(228,201,138,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(228,201,138,0.3) 1px, transparent 1px)",
          backgroundSize: "6rem 6rem",
          maskImage: "radial-gradient(60% 55% at 50% 42%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(60% 55% at 50% 42%, #000 0%, transparent 100%)",
        }}
      />

      {/* Marquee collar, top and bottom — the one piece of furniture that
          telegraphs "event" before the eye even reaches the headline. */}
      <div className="rule-gold mb-14" />
      <div className="mask-x-fade no-scrollbar mb-14 flex overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center">
          {[...marqueeItems, ...marqueeItems].map((label, i) => (
            <span key={i} className="mx-6 flex items-center gap-6 font-display text-sm uppercase tracking-[0.4em] text-champagne-light">
              {label}
              <span className="h-1 w-1 rotate-45 bg-champagne" />
            </span>
          ))}
        </div>
      </div>

      <div className="container-luxe relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.9, ease: easeLuxe }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-champagne-light/70">{t("blackFriday.eyebrow")}</span>

          {/* The Arabic line is kept untranslated on purpose in both locales
              — a calligraphic flourish the English layout wraps around,
              the way a maison might run one line of French through an
              otherwise English campaign. */}
          <p dir="rtl" className="mx-auto mt-7 max-w-3xl font-display text-[1.9rem] leading-[1.7] text-gold sm:text-[2.5rem]">
            {t("blackFriday.arabicLine")}
          </p>

          <h2 className="mx-auto mt-9 max-w-2xl font-display text-[2.6rem] leading-[1.05] sm:text-[3.6rem] lg:text-[4.4rem]">
            {t("blackFriday.headlineA")}{" "}
            <em className="text-gold not-italic">{t("blackFriday.headlineEm")}</em> {t("blackFriday.headlineB")}
          </h2>

          <p className="mx-auto mt-6 max-w-md text-[15px] leading-[1.8] text-ivory/55">{t("blackFriday.paragraph")}</p>

          <Link
            href="/shop"
            className="group relative mt-11 inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-champagne/50 px-10 text-[12px] uppercase tracking-[0.2em] text-champagne-light transition-colors duration-500 hover:text-noir"
          >
            <span className="absolute inset-0 -z-10 translate-y-full bg-gradient-to-t from-champagne to-champagne-light transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
            <span className="relative">{t("blackFriday.cta")}</span>
          </Link>
        </motion.div>
      </div>

      <div className="rule-gold mt-14" />
    </section>
  );
}
