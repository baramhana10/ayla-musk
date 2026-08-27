"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const easeLuxe = [0.22, 1, 0.36, 1] as const;

const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: easeLuxe } },
};

type Tone = "light" | "dark" | "warm" | "warm-deep";

const ruleColor: Record<Tone, string> = {
  light: "bg-charcoal/15",
  dark: "bg-champagne/50",
  warm: "bg-[var(--hw-tan)]/45",
  "warm-deep": "bg-[var(--hw-tan)]/40",
};
const indexColor: Record<Tone, string> = {
  light: "text-champagne",
  dark: "text-champagne-light",
  warm: "text-[var(--hw-brown-light)]",
  "warm-deep": "text-[var(--hw-tan-light)]",
};
const eyebrowColor: Record<Tone, string> = {
  light: "text-charcoal/45",
  dark: "text-ivory/50",
  warm: "text-[var(--hw-brown)]/70",
  "warm-deep": "text-[var(--hw-tan-light)]/85",
};
const titleColor: Record<Tone, string> = {
  light: "text-charcoal",
  dark: "text-ivory",
  warm: "text-[var(--hw-espresso)]",
  "warm-deep": "text-[var(--hw-cream)]",
};
const descColor: Record<Tone, string> = {
  light: "text-charcoal/55",
  dark: "text-ivory/50",
  warm: "text-[var(--hw-brown)]",
  "warm-deep": "text-[var(--hw-tan-light)]/80",
};

/**
 * The house's section mark: a numbered eyebrow flanked by a rule that draws
 * itself in, then the title. Numbering the sections is what turns a stack of
 * generic content blocks into something that reads as an edited publication.
 *
 * `warm`/`warm-deep` are additive tones for the homepage's white + warm-brown
 * treatment (`warm` on cream/white sections, `warm-deep` on the espresso
 * bands) — every other page keeps using `light`/`dark` unchanged.
 */
export default function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  align = "center",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  /** Two-digit section number, e.g. "02". */
  index?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  tone?: Tone;
  className?: string;
}) {
  const centered = align === "center";

  return (
    <motion.div
      variants={group}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
      className={cn("max-w-2xl", centered ? "mx-auto text-center" : "text-start", className)}
    >
      {(eyebrow || index) && (
        <motion.div
          variants={item}
          className={cn("flex items-center gap-4", centered ? "justify-center" : "justify-start")}
        >
          {centered && <span className={cn("h-px w-10 origin-right rtl:origin-left", ruleColor[tone])} />}
          {index && <span className={cn("font-display text-[13px]", indexColor[tone])}>{index}</span>}
          {eyebrow && (
            <span className={cn("text-[10px] uppercase tracking-[0.36em]", eyebrowColor[tone])}>{eyebrow}</span>
          )}
          <span className={cn("h-px w-10 origin-left rtl:origin-right", ruleColor[tone])} />
        </motion.div>
      )}

      <motion.h2
        variants={item}
        className={cn(
          "mt-6 font-display text-[2.1rem] leading-[1.06] tracking-[-0.01em] sm:text-[2.9rem] md:text-[3.4rem]",
          titleColor[tone]
        )}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          variants={item}
          className={cn("mt-5 text-[15px] leading-relaxed", descColor[tone], centered && "mx-auto max-w-lg")}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
