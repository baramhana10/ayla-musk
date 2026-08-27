"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { editorial } from "@/lib/images";
import { useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

const shots = [
  { src: editorial.pinkHairPortrait, tall: true },
  { src: editorial.nailPolishHands, tall: false },
  { src: editorial.blondePortrait, tall: false },
  { src: editorial.redManicure, tall: true },
  { src: editorial.handEyeshadow, tall: false },
  { src: editorial.lipsCloseup, tall: false },
];

/**
 * Staggered heights and a per-tile lift on hover, so the community wall reads
 * as a pinned mood board rather than a six-square contact sheet.
 */
export default function InstaGallery() {
  const t = useT();
  return (
    <section className="bg-[var(--hw-white)] py-24 sm:py-32">
      <div className="container-luxe">
      <div className="flex flex-col gap-6 border-b border-[var(--hw-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-display text-[13px] text-[var(--hw-brown-light)]">05</span>
            <span className="h-px w-10 bg-[var(--hw-line)]" />
            <span className="text-[10px] uppercase tracking-[0.36em] text-[var(--hw-brown)]/70">{t("instagram.eyebrow")}</span>
          </div>
          <h2 className="mt-5 font-display text-[2.1rem] leading-[1.06] text-[var(--hw-espresso)] sm:text-[2.9rem] md:text-[3.4rem]">
            {t("instagram.title")}
          </h2>
        </div>
        <a
          href="#"
          className="link-draw inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[var(--hw-brown)] transition-colors hover:text-[var(--hw-espresso)]"
        >
          <InstagramIcon size={15} /> {t("instagram.follow")}
        </a>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-6">
        {shots.map((s, i) => (
          <motion.a
            href="#"
            key={s.src}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.07, ease: easeLuxe }}
            className={`group relative overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 ${
              s.tall ? "aspect-[3/4] lg:mt-8" : "aspect-square"
            }`}
          >
            <Image
              src={s.src}
              alt="Ayla Musk community"
              fill
              sizes="(max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--hw-espresso)]/0 opacity-0 transition-all duration-500 group-hover:bg-[var(--hw-espresso)]/45 group-hover:opacity-100">
              <InstagramIcon size={18} className="text-[var(--hw-cream)]" />
            </div>
            <span className="pointer-events-none absolute inset-2 border border-[var(--hw-tan-light)]/0 transition-all duration-700 group-hover:inset-3 group-hover:border-[var(--hw-tan-light)]/50" />
          </motion.a>
        ))}
      </div>
      </div>
    </section>
  );
}
