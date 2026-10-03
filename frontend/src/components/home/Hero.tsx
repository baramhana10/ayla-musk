"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useLocale, useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

const stage: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeLuxe } },
};

/** Words lift out of a clipped line — set type behaving like set type. Split
 *  by word (never mid-word) so Arabic's cursive shaping stays intact. */
const word: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1, ease: easeLuxe } },
};

export default function Hero() {
  const introComplete = useUIStore((s) => s.introComplete);
  const prefersReducedMotion = useReducedMotion();
  const t = useT();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const headline = [
    [{ text: t("hero.line1a") }, { text: t("hero.line1b") }],
    [{ text: t("hero.line2a"), accent: true }, { text: t("hero.line2b") }],
  ];

  const shown = introComplete || prefersReducedMotion;

  return (
    <section
      // -mt-20 slides the hero up under the sticky bar so the warm field runs
      // edge to edge behind the transparent navbar; z-0 keeps the bar on top.
      className="grain-warm relative isolate z-0 -mt-20 flex min-h-[100svh] items-center overflow-hidden bg-[var(--hw-cream)] pt-20 text-[var(--hw-ink)]"
    >
      {/* Atmosphere: soft warm blooms and a fine bronze grid that only just
          register — daylight depth in place of the noir hero's night glow. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_62%_28%,#f6ead9_0%,#fbf6ef_52%,#fffdfa_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(138,98,68,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(138,98,68,0.2) 1px, transparent 1px)",
            backgroundSize: "6.5rem 6.5rem",
            maskImage: "radial-gradient(70% 60% at 50% 45%, #000 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(70% 60% at 50% 45%, #000 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Editorial furniture: a rule and vertical caption in the margin — a
          Latin-only magazine detail (vertical Arabic isn't idiomatic script,
          so it simply sits out the Arabic pass rather than being forced). */}
      {!isArabic && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="pointer-events-none absolute inset-y-0 start-6 hidden w-px bg-gradient-to-b from-transparent via-[var(--hw-tan)]/40 to-transparent lg:block xl:start-10"
          />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={shown ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.1, duration: 0.9, ease: easeLuxe }}
            className="vertical-rl pointer-events-none absolute bottom-16 start-6 hidden text-[10px] uppercase tracking-[0.45em] text-[var(--hw-brown)]/45 lg:block xl:start-10"
          >
            {t("hero.margin")}
          </motion.span>
        </>
      )}

      <div className="container-luxe relative grid grid-cols-1 items-center gap-14 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-0">
        {/* ------------------------------------------------ copy */}
        <motion.div
          variants={stage}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={shown ? "visible" : "hidden"}
          className="order-2 text-center lg:order-1 lg:ps-8 lg:text-start xl:ps-14"
        >
          <motion.div variants={rise} className="flex items-center justify-center gap-4 lg:justify-start">
            <span className="h-px w-10 bg-[var(--hw-tan)]" />
            <span className="text-[10px] uppercase tracking-[0.42em] text-[var(--hw-brown)]">{t("hero.kicker")}</span>
          </motion.div>

          <h1
            className={`mt-8 font-display text-[3.1rem] leading-[0.94] sm:text-[4.4rem] lg:text-[5.1rem] xl:text-[6rem] ${
              isArabic ? "tracking-normal" : "tracking-[-0.01em]"
            }`}
          >
            {headline.map((line, li) => (
              <span key={li} className="block overflow-hidden pb-[0.08em]">
                {line.map((w, wi) => (
                  <motion.span key={wi} variants={word} className="me-[0.24em] inline-block">
                    {w.accent ? <em className="not-italic text-[var(--hw-brown)]">{w.text}</em> : w.text}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            variants={rise}
            className="mx-auto mt-8 max-w-[27rem] text-[15px] leading-[1.75] text-[var(--hw-brown)] lg:mx-0"
          >
            {t("hero.paragraph")}
          </motion.p>

          <motion.div variants={rise} className="mx-auto mt-7 max-w-[27rem] border-s-2 border-[var(--hw-tan)] ps-5 text-start lg:mx-0">
            <p className="font-display text-[2rem] leading-[1.5] text-[var(--hw-brown-deep)] sm:text-[2.5rem]">{t("hero.madeInDubai")}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--hw-brown)]">{t("hero.originQuality")}</p>
          </motion.div>

          <motion.div
            variants={rise}
            className="mt-11 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start"
          >
            {/* Primary: espresso fill wipes up from the baseline on hover. */}
            <Link
              href="/shop"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-[var(--hw-brown-deep)]/70 px-10 text-[13px] font-medium tracking-[0.14em] uppercase text-[var(--hw-espresso)] transition-colors duration-500 hover:text-[var(--hw-cream)]"
            >
              <span className="absolute inset-0 -z-10 translate-y-full bg-gradient-to-t from-[var(--hw-espresso)] to-[var(--hw-brown-deep)] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              {t("hero.ctaPrimary")}
              <ArrowIcon
                size={15}
                className="ms-3 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              />
            </Link>

            <Link
              href="/shop?category=musk-oil"
              className="link-draw text-[13px] tracking-[0.14em] uppercase text-[var(--hw-brown)] transition-colors hover:text-[var(--hw-espresso)]"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </motion.div>

          {/* Facts as a set table, not a badge row. */}
          <motion.dl
            variants={rise}
            className="mt-16 grid max-w-md grid-cols-3 gap-px overflow-hidden border-y border-[var(--hw-line)] bg-[var(--hw-line)] lg:mx-0"
          >
            {[
              { k: t("hero.stat1k"), v: t("hero.stat1v") },
              { k: t("hero.stat2k"), v: t("hero.stat2v") },
              { k: t("hero.stat3k"), v: t("hero.stat3v") },
            ].map((s) => (
              <div key={s.v} className="bg-[var(--hw-cream)] px-3 py-5 text-center lg:text-start">
                <dt className="font-display text-2xl text-[var(--hw-espresso)]">{s.k}</dt>
                <dd className="mt-1.5 text-[9.5px] uppercase leading-relaxed tracking-[0.16em] text-[var(--hw-brown)]/70">
                  {s.v}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ------------------------------------------------ product plinth */}
        <motion.div
          className="order-1 flex justify-center lg:order-2"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={shown ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: easeLuxe }}
            className="relative"
          >
            {/* Halo behind the object. */}
            <div className="absolute -inset-12 -z-10 bg-[radial-gradient(ellipse,rgba(201,163,119,0.2),transparent_70%)]" />

            {/* Warm tan frame offset behind the photograph. */}
            <motion.div
              initial={{ opacity: 0, x: 26, y: 26 }}
              animate={shown ? { opacity: 1, x: isArabic ? -18 : 18, y: 18 } : {}}
              transition={{ duration: 1.2, delay: 0.55, ease: easeLuxe }}
              className="absolute inset-0 rounded-[1.75rem] border border-[var(--hw-tan)]/45"
              aria-hidden="true"
            />

            <motion.figure
              className="shadow-warm-plinth relative aspect-[19/24] w-[min(19rem,78vw)] overflow-hidden rounded-[1.75rem] sm:aspect-[24/31] sm:w-[24rem]"
            >
              <Image
                src="/products/musk-collection-giftbox.jpg"
                alt="Ayla Musk — the Musk Collection five-piece gift set"
                fill
                priority
                sizes="(max-width: 640px) 76vw, 24rem"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--hw-espresso)]/55 via-transparent to-[var(--hw-espresso)]/10" />

              {/* One-shot foil sweep as the object settles. */}
              {!prefersReducedMotion && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--hw-tan-light)]/70 to-transparent"
                  style={{ mixBlendMode: "soft-light" }}
                  initial={{ x: "-160%", skewX: -14 }}
                  animate={shown ? { x: "420%", skewX: -14 } : {}}
                  transition={{ duration: 1.5, delay: 1.25, ease: easeLuxe }}
                />
              )}

              <motion.figcaption
                initial={{ opacity: 0, y: 16 }}
                animate={shown ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.05, ease: easeLuxe }}
                className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 border-t border-[var(--hw-cream)]/25 pt-4"
              >
                <div>
                  <p className="font-display text-lg leading-tight text-[var(--hw-cream)]">{t("hero.productName")}</p>
                  <p className="mt-1 text-[9.5px] uppercase tracking-[0.2em] text-[var(--hw-cream)]/65">{t("hero.productSub")}</p>
                </div>
                <span className="font-display text-sm text-[var(--hw-tan-light)]">01</span>
              </motion.figcaption>
            </motion.figure>

          </motion.div>
        </motion.div>
      </div>

      {/* Static scroll cue avoids continuous animation while the page is idle. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.45em] text-[var(--hw-brown)]/60">{t("hero.scroll")}</span>
        <span className="relative h-12 w-px overflow-hidden bg-[var(--hw-brown)]/20">
          <span
            className="absolute inset-x-0 top-0 h-1/2 bg-[var(--hw-brown-deep)]"
          />
        </span>
      </motion.div>
    </section>
  );
}
