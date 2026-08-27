"use client";

import type { FragranceNotes } from "@/lib/types";
import { useT } from "@/store/locale";

export default function NotesPyramid({ notes, accent }: { notes: FragranceNotes; accent: string }) {
  const t = useT();
  const tiers: { key: keyof FragranceNotes; label: string; width: string }[] = [
    { key: "top", label: t("product.topNotes"), width: "w-full" },
    { key: "heart", label: t("product.heartNotes"), width: "w-4/5" },
    { key: "base", label: t("product.baseNotes"), width: "w-3/5" },
  ];

  return (
    <div className="space-y-5">
      {tiers.map((tier) => (
        <div key={tier.key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className={tier.width + " sm:w-32 sm:shrink-0"}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">{tier.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes[tier.key].map((note) => (
              <span
                key={note}
                className="rounded-full border px-3 py-1.5 text-xs text-charcoal/75"
                style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0f` }}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
