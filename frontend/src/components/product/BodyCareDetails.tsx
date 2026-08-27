"use client";

import { Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useT } from "@/store/locale";

export default function BodyCareDetails({ product }: { product: Product }) {
  const t = useT();
  const benefits = product.benefits ?? [];
  const ingredients = product.ingredients ?? [];

  return (
    <div className="space-y-6">
      {benefits.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">{t("product.benefits")}</p>
          <ul className="space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-charcoal/75">
                <Check size={14} className="mt-0.5 shrink-0 text-deep-rose" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ingredients.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">{t("product.ingredients")}</p>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((i) => (
              <span
                key={i}
                className="rounded-full border px-3 py-1.5 text-xs text-charcoal/75"
                style={{ borderColor: `${product.accent}55`, backgroundColor: `${product.accent}0f` }}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {product.howToUse && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">{t("product.howToUse")}</p>
          <p className="text-sm leading-relaxed text-charcoal/70">{product.howToUse}</p>
        </div>
      )}
    </div>
  );
}
