"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { communicationsApi, ApiClientError, type ContactMessageDto, type NewsletterSubscriberDto } from "@/lib/api";
import { useLocale, useT } from "@/store/locale";

export default function CommunicationsPage() {
  const ar = useLocale() === "ar";
  const t = useT();
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => {
    return Promise.all([communicationsApi.messages(), communicationsApi.subscribers()]).then(([inbox, list]) => {
      setMessages(inbox.messages); setSubscribers(list.subscribers);
    }).catch(err => { setError(err instanceof Error ? err.message : "Unable to load messages."); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { void load(); }, [load]);
  function refresh() { setLoading(true); setError(""); void load(); }
  async function markRead(message: ContactMessageDto) {
    setBusy(message.id);
    try { const result = await communicationsApi.markRead(message.id, !message.read); setMessages(current => current.map(item => item.id === message.id ? result.message : item)); }
    catch (err) { toast.error(err instanceof ApiClientError ? err.message : t("common.requestFailed")); }
    finally { setBusy(null); }
  }
  async function toggleSubscriber(subscriber: NewsletterSubscriberDto) {
    setBusy(subscriber.email);
    try { const result = await communicationsApi.setSubscriberActive(subscriber.email, !subscriber.active); setSubscribers(current => current.map(item => item.email === subscriber.email ? result.subscriber : item)); }
    catch (err) { toast.error(err instanceof ApiClientError ? err.message : t("common.requestFailed")); }
    finally { setBusy(null); }
  }
  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl">{ar ? "الرسائل والاشتراكات" : "Messages & subscribers"}</h1>
      <Button variant="outline" onClick={refresh} disabled={loading}>{ar ? "تحديث" : "Refresh"}</Button>
    </div>
    <p className="max-w-2xl text-sm leading-relaxed text-charcoal/60">{ar ? "تُحفظ الرسائل والاشتراكات في قاعدة البيانات. الإرسال الآلي للبريد يحتاج إلى إعداد خدمة بريد؛ لم يتم إرسال أي رسائل تلقائيًا." : "Messages and subscriptions are saved in the database. Automated email delivery requires a configured email service; no emails are sent automatically."}</p>
    {error && <p role="alert" className="text-wine">{error}</p>}
    {loading ? <p role="status">{t("common.loading")}</p> : <>
      <section aria-labelledby="inbox-title" className="space-y-4">
        <h2 id="inbox-title" className="font-display text-2xl">{ar ? "صندوق الرسائل" : "Inbox"} ({messages.length})</h2>
        {messages.length === 0 && <p className="text-sm text-charcoal/55">{ar ? "لا توجد رسائل بعد." : "No messages yet."}</p>}
        {messages.map(message => <article key={message.id} className={`rounded-2xl border p-5 ${message.read ? "border-charcoal/10 bg-ivory" : "border-deep-rose/25 bg-blush-soft/40"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><h3 className="font-medium break-words">{message.subject || (ar ? "رسالة جديدة" : "New message")}</h3><p className="mt-1 break-words text-sm">{message.name} · <a href={`mailto:${message.email}`} className="text-deep-rose underline">{message.email}</a></p><time className="text-xs text-charcoal/50">{new Date(message.createdAt).toLocaleString(ar ? "ar" : "en")}</time></div>
            <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => markRead(message)}>{message.read ? (ar ? "تحديد كغير مقروءة" : "Mark unread") : (ar ? "تحديد كمقروءة" : "Mark read")}</Button>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>
        </article>)}
      </section>
      <section aria-labelledby="subscribers-title" className="space-y-4">
        <h2 id="subscribers-title" className="font-display text-2xl">{ar ? "قائمة المشتركين" : "Subscribers"} ({subscribers.length})</h2>
        {subscribers.length === 0 && <p className="text-sm text-charcoal/55">{ar ? "لا توجد اشتراكات بعد." : "No subscribers yet."}</p>}
        {subscribers.map(subscriber => <div key={subscriber.email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
          <div className="min-w-0"><p className="break-all text-sm">{subscriber.email}</p><span className="text-xs text-charcoal/55">{subscriber.active ? (ar ? "نشط" : "Active") : (ar ? "متوقف" : "Stopped")}</span></div>
          <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => toggleSubscriber(subscriber)}>{subscriber.active ? (ar ? "إيقاف الاشتراك" : "Unsubscribe") : (ar ? "إعادة التفعيل" : "Reactivate")}</Button>
        </div>)}
      </section>
    </>}
  </div>;
}
