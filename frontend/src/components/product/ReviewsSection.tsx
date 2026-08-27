"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import type { ProductReview } from "@/lib/types";
import Rating from "@/components/ui/Rating";
import { useT, useLocale } from "@/store/locale";

/**
 * Display-only — there is no customer account system on this storefront
 * (cash-on-delivery, guest-only checkout), so review submission, which
 * previously required signing in, has no path left to reach it from.
 */
export default function ReviewsSection({
  initialReviews,
  averageRating,
}: {
  productId: string;
  initialReviews: ProductReview[];
  averageRating: number;
}) {
  const t = useT();
  const locale = useLocale();
  const [reviews] = useState(initialReviews);
  const [avgRating] = useState(averageRating);

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = reviews.length || 1;

  return (
    <div id="reviews">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center sm:text-start">
          <p className="font-display text-5xl text-charcoal">{avgRating.toFixed(1)}</p>
          <Rating value={avgRating} size={15} className="mt-2 justify-center sm:justify-start" />
          <p className="mt-1 text-xs text-charcoal/45">{reviews.length} {t("product.reviews")}</p>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-3 text-xs text-charcoal/55">
              <span className="w-10 shrink-0">{b.star} {t("product.star")}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blush">
                <div className="h-full rounded-full bg-champagne" style={{ width: `${(b.count / total) * 100}%` }} />
              </div>
              <span className="w-6 shrink-0 text-end">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 divide-y divide-charcoal/8">
        {reviews.map((r) => (
          <div key={r.id} className="py-6">
            <div className="flex flex-wrap items-center gap-2">
              <Rating value={r.rating} size={13} />
              {r.verified && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-deep-rose">
                  <BadgeCheck size={12} /> {t("product.verifiedPurchase")}
                </span>
              )}
            </div>
            <p className="mt-2 font-display text-base text-charcoal">{r.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-charcoal/65">{r.body}</p>
            <p className="mt-3 text-xs text-charcoal/40">
              {r.author} — {new Date(r.date).toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        ))}
        {reviews.length === 0 && <p className="py-6 text-sm text-charcoal/45">{t("product.beFirstReview")}</p>}
      </div>
    </div>
  );
}
