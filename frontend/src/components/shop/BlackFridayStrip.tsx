"use client";

import { useT } from "@/store/locale";

/**
 * A slim noir-and-gold collar above the shop grid — the Black Friday cue for
 * anyone who lands straight on /shop without passing through the homepage
 * banner. Deliberately just a strip: the grid below still has to do the
 * actual selling.
 */
export default function BlackFridayStrip() {
  const t = useT();
  const items = Array.from({ length: 8 }, () => t("blackFriday.marquee"));

  return (
    <div className="relative overflow-hidden border-b border-champagne/20 bg-noir py-4">
      <div className="mask-x-fade no-scrollbar flex overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center">
          {[...items, ...items].map((label, i) => (
            <span key={i} className="mx-6 flex items-center gap-6 font-display text-xs uppercase tracking-[0.35em] text-champagne-light">
              {label}
              <span className="h-1 w-1 rotate-45 bg-champagne" />
              <span className="font-sans text-[10px] font-normal tracking-normal text-ivory/55">{t("blackFriday.stripNote")}</span>
              <span className="h-1 w-1 rotate-45 bg-champagne" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
