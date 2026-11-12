"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { communicationsApi, ApiClientError } from "@/lib/api";
import { useT } from "@/store/locale";

export default function UnsubscribeForm({ token }: { token: string }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const valid = /^[a-f0-9]{64}$/.test(token);
  async function unsubscribe() {
    if (busy) return;
    setBusy(true); setError("");
    try { await communicationsApi.unsubscribe(token); setDone(true); }
    catch (err) { setError(err instanceof ApiClientError ? err.message : t("common.requestFailed")); }
    finally { setBusy(false); }
  }
  return <div className="container-luxe py-24 text-center">
    <h1 className="font-display text-3xl">{t("newsletter.unsubscribeTitle")}</h1>
    {done ? <p role="status" className="mt-6">{t("newsletter.unsubscribed")}</p> : valid ? <Button onClick={unsubscribe} disabled={busy} className="mt-6">{busy ? t("common.loading") : t("newsletter.unsubscribeAction")}</Button> : <p className="mt-6">{t("newsletter.invalidLink")}</p>}
    {error && <p role="alert" className="mt-4 text-wine">{error}</p>}
    <Link href="/contact" className="mt-6 block text-sm text-deep-rose underline">{t("footer.contactUs")}</Link>
  </div>;
}
