"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useT } from "@/store/locale";

/**
 * The first pixel of the site every visitor sees, on every route — so it's
 * the one place that guarantees "there is a Black Friday here" lands before
 * anyone scrolls. Noir + gold foil, same vocabulary as the homepage banner
 * and the shop strip, so the signal is consistent the moment someone enters
 * the site from any page, not just the homepage.
 */
export default function AnnouncementBar() {
  const t = useT();
  const messages = [t("blackFriday.barM1"), t("blackFriday.barM2"), t("blackFriday.barM3")];

  return (
    <Link
      href="/shop"
      className="group grain relative isolate block overflow-hidden bg-gradient-to-r from-noir via-noir-soft to-noir"
    >
      <div className="no-scrollbar flex whitespace-nowrap py-2.5 animate-marquee">
        {[...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="mx-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
            <Sparkles size={11} className="shrink-0 text-champagne" />
            <span className="text-gold font-medium transition-[letter-spacing] duration-500 group-hover:tracking-[0.26em]">{m}</span>
            <span className="text-champagne/50">✦</span>
          </span>
        ))}
      </div>
      <div className="rule-gold absolute inset-x-0 bottom-0" />
    </Link>
  );
}
