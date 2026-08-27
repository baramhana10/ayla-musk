"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { reviewsApi, ApiClientError, type AdminReviewDto } from "@/lib/api";
import Rating from "@/components/ui/Rating";
import { useT, useLocale } from "@/store/locale";

export default function AdminReviewsPage() {
  const t = useT();
  const locale = useLocale();
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.listAll().then((res) => setReviews(res.reviews)).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  async function handleDelete(id: string) {
    try {
      await reviewsApi.remove(id);
      toast.success(t("admin.reviews.removed"));
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.reviews.removeError"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">{t("admin.reviews.title")}</h1>
      <p className="mt-1 text-sm text-charcoal/50">{reviews.length} {t("admin.reviews.subtitle")}</p>

      <div className="mt-6 divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-ivory">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 p-5">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Rating value={r.rating} size={13} />
                <span className="text-xs text-charcoal/40">{t("admin.reviews.on")} {r.productName}</span>
              </div>
              <p className="mt-2 font-display text-base text-charcoal">{r.title}</p>
              <p className="mt-1 text-sm text-charcoal/60">{r.body}</p>
              <p className="mt-2 text-xs text-charcoal/40">{r.author} — {new Date(r.date).toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-US")}</p>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="shrink-0 rounded-lg p-2 text-charcoal/40 hover:bg-blush hover:text-wine cursor-pointer"
              aria-label={t("common.delete")}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {reviews.length === 0 && <p className="p-8 text-center text-sm text-charcoal/45">{t("admin.reviews.noReviews")}</p>}
      </div>
    </div>
  );
}
