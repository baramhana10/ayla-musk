"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { communicationsApi, ApiClientError } from "@/lib/api";
import { useT } from "@/store/locale";

/** Shared, server-backed form. No success UI until MongoDB acknowledges save. */
export default function NewsletterForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await communicationsApi.subscribe(email.trim());
      setToken(result.unsubscribeToken ?? null);
      toast.success(t("newsletter.footerSubscribed"));
      setEmail("");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : t("common.requestFailed"));
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-6 max-w-sm">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-champagne">{t("newsletter.footerJoin")}</p>
      <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/5 pe-1.5 ps-4 py-1.5 focus-within:border-champagne transition-colors">
        <input type="email" required maxLength={254} aria-label={t("newsletter.footerPlaceholder")} value={email} onChange={event => setEmail(event.target.value)} placeholder={t("newsletter.footerPlaceholder")} className="min-w-0 flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/35 outline-none" />
        <button type="submit" disabled={busy} aria-label={t("newsletter.subscribe")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne text-charcoal transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 cursor-pointer">
          <ArrowRight size={14} className="rtl:-scale-x-100" />
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ivory/55">{t("newsletter.consent")}</p>
      {token && <Link href={`/unsubscribe?token=${token}`} className="mt-2 block text-xs text-champagne underline">{t("newsletter.manageSubscription")}</Link>}
    </form>
  );
}
