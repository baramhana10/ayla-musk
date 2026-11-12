"use client";

import { motion } from "framer-motion";
import { useT } from "@/store/locale";
import NewsletterForm from "@/components/forms/NewsletterForm";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * The closing plate. Full-bleed noir so the page ends on the same note it
 * opened on, with the form set as a single ruled line rather than a boxed input
 * — the difference between a signup widget and a subscription card.
 */
export default function NewsletterBanner() {
  const t = useT();

  return (
    <section className="grain-warm relative isolate overflow-hidden bg-[var(--hw-espresso)] py-24 text-[var(--hw-cream)] sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_50%_0%,#4a3324_0%,#3a2a1e_58%,#2a1d15_100%)]" />
        <div className="animate-aurora absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--hw-tan)]/18 blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.9, ease: easeLuxe }}
        className="container-luxe max-w-3xl text-center"
      >
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-[var(--hw-tan)]/45" />
          <span className="text-[10px] uppercase tracking-[0.36em] text-[var(--hw-tan-light)]/85">
            {t("newsletter.eyebrow")}
          </span>
          <span className="h-px w-10 bg-[var(--hw-tan)]/45" />
        </div>

        <h2 className="mt-8 font-display text-[2.3rem] leading-[1.06] sm:text-[3.2rem] md:text-[3.8rem]">
          {t("newsletter.titleA")} <em className="text-bronze italic">{t("newsletter.titleEm")}</em>{t("newsletter.titleB")}
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[var(--hw-cream)]/55">
          {t("newsletter.paragraph")}
        </p>

        <div className="mx-auto mt-12 max-w-sm text-start"><NewsletterForm /></div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-[var(--hw-cream)]/30">
          {t("newsletter.unsubscribe")}
        </p>
      </motion.div>
    </section>
  );
}
