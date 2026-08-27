"use client";

import { Check, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { useT } from "@/store/locale";

export default function LensSpecs({ product }: { product: Product }) {
  const t = useT();

  const rows: { label: string; value?: string }[] = [
    { label: t("product.lensType"), value: product.lensType },
    { label: t("product.lensColor"), value: product.lensColor },
    { label: t("product.diameter"), value: product.diameter },
    { label: t("product.baseCurve"), value: product.baseCurve },
    { label: t("product.replacementDuration"), value: product.replacementDuration },
    { label: t("product.material"), value: product.material },
    { label: t("product.waterContent"), value: product.waterContent },
  ].filter((r) => r.value);

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-charcoal/8 overflow-hidden rounded-xl border border-charcoal/10">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-charcoal/50">{r.label}</dt>
            <dd className="font-medium text-charcoal">{r.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <dt className="text-charcoal/50">{t("product.prescriptionAvailable")}</dt>
          <dd className="flex items-center gap-1.5 font-medium text-charcoal">
            {product.prescriptionAvailable ? (
              <>
                <Check size={14} className="text-green-700" /> {t("common.yes")}
              </>
            ) : (
              <>
                <X size={14} className="text-charcoal/40" /> {t("common.no")}
              </>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
