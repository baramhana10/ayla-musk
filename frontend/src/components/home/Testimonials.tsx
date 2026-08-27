"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/lib/mock-data";
import Rating from "@/components/ui/Rating";
import { useT, useLocale } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;
const INTERVAL = 7000;

/**
 * One quote at a time, set large. A four-up card grid makes every review look
 * like filler; giving a single voice the whole width makes it read as a pull
 * quote in a feature — and the auto-advance keeps the section alive without
 * asking anyone to click.
 */
export default function Testimonials() {
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const count = testimonials.length;
  const tr = useT();
  const locale = useLocale();
  const isArabic = locale === "ar";

  const go = useCallback(
    (step: number) => setState(([cur]) => [(cur + step + count) % count, step]),
    [count]
  );

  useEffect(() => {
    const id = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(id);
  }, [go, i]);

  const t = testimonials[i];

  return (
    <section className="relative overflow-hidden bg-[var(--hw-sand)] py-24 sm:py-32">
      <div className="container-luxe">
        <div className="flex items-center gap-4">
          <span className="font-display text-[13px] text-[var(--hw-brown-light)]">04</span>
          <span className="h-px w-10 bg-[var(--hw-line)]" />
          <span className="text-[10px] uppercase tracking-[0.36em] text-[var(--hw-brown)]/70">
            {tr("testimonials.eyebrow")}
          </span>
        </div>

        <div className="relative mt-12 min-h-[19rem] sm:min-h-[17rem]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={t.id}
              custom={dir}
              initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(7px)" }}
              transition={{ duration: 0.7, ease: easeLuxe }}
              className="max-w-4xl"
            >
              <Rating value={t.rating} size={13} />
              <blockquote className="mt-6 font-display text-[1.7rem] leading-[1.28] text-[var(--hw-espresso)] sm:text-[2.3rem] md:text-[2.7rem]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--hw-tan)]" />
                <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--hw-brown)]">{t.name}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--hw-line)] pt-6">
          {/* Position shown as set numerals, not dots. */}
          <p className="font-display text-sm text-[var(--hw-brown)]/60 tabular-nums">
            <span className="text-[var(--hw-espresso)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-[var(--hw-brown)]/40">/</span>
            {String(count).padStart(2, "0")}
          </p>

          <div className="flex gap-2">
            {[
              { label: tr("testimonials.previous"), step: -1, Icon: isArabic ? ArrowRight : ArrowLeft },
              { label: tr("testimonials.next"), step: 1, Icon: isArabic ? ArrowLeft : ArrowRight },
            ].map(({ label, step, Icon }) => (
              <button
                key={label}
                aria-label={label}
                onClick={() => go(step)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--hw-line)] text-[var(--hw-brown)] transition-all duration-500 hover:border-[var(--hw-brown-deep)] hover:bg-[var(--hw-brown-deep)] hover:text-[var(--hw-cream)]"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
