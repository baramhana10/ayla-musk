"use client";

import { useT } from "@/store/locale";

/**
 * The seam between the warm hero and the white/cream editorial below it. Set
 * in warm brown on cream so the transition reads as a deliberate band rather
 * than an abrupt colour change, and feathered at both edges so the loop never
 * shows a hard cut.
 */
export default function BrandStrip() {
  const t = useT();
  const values = [
    t("brandStrip.v1"),
    t("brandStrip.v2"),
    t("brandStrip.v3"),
    t("brandStrip.v4"),
    t("brandStrip.v5"),
  ];

  return (
    <div className="relative overflow-hidden border-y border-[var(--hw-line)] bg-[var(--hw-sand)] py-5">
      <div className="mask-x-fade no-scrollbar flex overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center">
          {[...values, ...values, ...values].map((v, i) => (
            <span
              key={i}
              className="mx-7 flex items-center gap-7 text-[10px] uppercase tracking-[0.3em] text-[var(--hw-brown)]"
            >
              {v}
              <span className="h-1 w-1 rotate-45 bg-[var(--hw-tan)]" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
