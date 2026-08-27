"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
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
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeLuxe } },
};

/** Words lift out of a clipped line — set type behaving like set type. Split
 *  by word (never mid-word) so Arabic's cursive shaping stays intact. */
const word: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1, ease: easeLuxe } },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
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

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const scrollAtmosY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scrollPlinthY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const scrollCopyY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scrollFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // Scroll-linked parallax is a vestibular trigger — pinned to a constant
  // rather than driven by scroll position when motion is reduced.
  const atmosY = prefersReducedMotion ? "0%" : scrollAtmosY;
  const plinthY = prefersReducedMotion ? "0%" : scrollPlinthY;
  const copyY = prefersReducedMotion ? "0%" : scrollCopyY;
  const fade = prefersReducedMotion ? 1 : scrollFade;

  // Pointer parallax on the product only. The type stays anchored — a headline
  // that tilts with the cursor reads as a gimmick, a lit object does not.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 70, damping: 16 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 70, damping: 16 });
  const glareX = useSpring(useTransform(px, [-0.5, 0.5], ["18%", "82%"]), { stiffness: 70, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  const shown = introComplete || prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      // -mt-20 slides the hero up under the sticky bar so the warm field runs
      // edge to edge behind the transparent navbar; z-0 keeps the bar on top.
      className="grain-warm relative isolate z-0 -mt-20 flex min-h-[100svh] items-center overflow-hidden bg-[var(--hw-cream)] pt-20 text-[var(--hw-ink)]"
    >
      {/* Atmosphere: soft warm blooms and a fine bronze grid that only just
          register — daylight depth in place of the noir hero's night glow. */}
      <motion.div style={{ y: atmosY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_62%_28%,#f6ead9_0%,#fbf6ef_52%,#fffdfa_100%)]" />
        <div className="animate-aurora absolute -left-40 top-[-12%] h-[46rem] w-[46rem] rounded-full bg-[var(--hw-tan)]/22 blur-[140px]" />
        <div className="animate-aurora-slow absolute -right-32 bottom-[-18%] h-[42rem] w-[42rem] rounded-full bg-[var(--hw-brown-light)]/14 blur-[150px]" />
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
      </motion.div>

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
          style={{ opacity: fade, y: copyY }}
          variants={stage}
          initial="hidden"
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
                    {w.accent ? <em className="text-bronze not-italic">{w.text}</em> : w.text}
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
          style={{ y: plinthY, perspective: 1200 }}
          className="order-1 flex justify-center lg:order-2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={shown ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.25, ease: easeLuxe }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Halo behind the object. */}
            <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-[var(--hw-tan)]/25 blur-[90px]" />

            {/* Warm tan frame offset behind the photograph. */}
            <motion.div
              initial={{ opacity: 0, x: 26, y: 26 }}
              animate={shown ? { opacity: 1, x: isArabic ? -18 : 18, y: 18 } : {}}
              transition={{ duration: 1.2, delay: 0.55, ease: easeLuxe }}
              className="absolute inset-0 rounded-[1.75rem] border border-[var(--hw-tan)]/45"
              aria-hidden="true"
            />

            <motion.figure
              animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
              className="shadow-warm-plinth relative h-[24rem] w-[19rem] overflow-hidden rounded-[1.75rem] sm:h-[31rem] sm:w-[24rem]"
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

              {/* Glare tracks the pointer — the object reads as glass under a
                  fixed light rather than a flat card. */}
              {!prefersReducedMotion && (
                <motion.div
                  aria-hidden="true"
                  style={{ left: glareX, mixBlendMode: "soft-light" }}
                  className="absolute inset-y-0 -ml-24 w-48 bg-gradient-to-r from-transparent via-white/55 to-transparent blur-lg"
                />
              )}

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

            {/* Reflection on the plinth. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-full h-24 scale-y-[-1] overflow-hidden rounded-[1.75rem] opacity-[0.12] blur-[3px]"
              style={{
                maskImage: "linear-gradient(to top, transparent, #000)",
                WebkitMaskImage: "linear-gradient(to top, transparent, #000)",
              }}
            >
              <Image
                src="/products/musk-collection-giftbox.jpg"
                alt=""
                fill
                sizes="24rem"
                // object-bottom, not object-top: the row of the photo nearest the
                // plinth is the one that has to appear nearest the reflection.
                className="object-cover object-bottom"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue: a hairline that fills, rather than a bouncing chevron. */}
      <motion.div
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.45em] text-[var(--hw-brown)]/60">{t("hero.scroll")}</span>
        <span className="relative h-12 w-px overflow-hidden bg-[var(--hw-brown)]/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-[var(--hw-brown-deep)]"
            animate={prefersReducedMotion ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
