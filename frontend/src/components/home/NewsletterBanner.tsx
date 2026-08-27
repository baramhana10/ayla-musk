"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

/**
 * The closing plate. Full-bleed noir so the page ends on the same note it
 * opened on, with the form set as a single ruled line rather than a boxed input
 * — the difference between a signup widget and a subscription card.
 */
export default function NewsletterBanner() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error(t("newsletter.invalidEmail"));
      return;
    }
    setSubmitted(true);
    toast.success(t("newsletter.footerSubscribed"));
  }

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

        {submitted ? (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeLuxe }}
            className="mx-auto mt-12 max-w-md border-t border-[var(--hw-tan)]/30 pt-6 text-[14px] text-[var(--hw-tan-light)]"
          >
            {t("newsletter.thanks")} <span className="font-display tracking-[0.2em]">AYLA15</span> {t("newsletter.thanksEnd")} {email}.
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="group mx-auto mt-12 flex max-w-md items-center gap-4 border-b border-[var(--hw-cream)]/25 pb-3 transition-colors duration-500 focus-within:border-[var(--hw-tan)]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.placeholder")}
              aria-label={t("newsletter.emailLabel")}
              className="h-10 flex-1 bg-transparent text-[15px] text-[var(--hw-cream)] outline-none placeholder:text-[var(--hw-cream)]/30"
            />
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[var(--hw-tan-light)] transition-colors hover:text-[var(--hw-cream)]"
            >
              {t("newsletter.subscribe")}
              <ArrowRight size={14} className="transition-transform duration-500 group-focus-within:translate-x-1 rtl:group-focus-within:-translate-x-1 rtl:-scale-x-100" />
            </button>
          </form>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-[var(--hw-cream)]/30">
          {t("newsletter.unsubscribe")}
        </p>
      </motion.div>
    </section>
  );
}
