"use client";

import { useT } from "@/store/locale";

export default function AnnouncementBar() {
  const t = useT();
  const messages = [t("announcement.m1"), t("announcement.m2"), t("announcement.m3")];

  return (
    <div className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="no-scrollbar flex whitespace-nowrap py-2.5 text-[11px] tracking-[0.15em] uppercase animate-marquee">
        {[...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="mx-8 flex items-center gap-8">
            {m}
            <span className="text-champagne">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
