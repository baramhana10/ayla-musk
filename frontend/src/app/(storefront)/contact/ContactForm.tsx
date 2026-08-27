"use client";

import { useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useT } from "@/store/locale";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const t = useT();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email.includes("@") || !form.message) {
      toast.error(t("contact.fillFields"));
      return;
    }
    setSent(true);
    toast.success(t("contact.receivedBody"));
  }

  return (
    <div className="container-luxe py-14 sm:py-20">
      <div className="mx-auto max-w-lg text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">{t("contact.eyebrow")}</span>
        <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">{t("contact.title")}</h1>
        <p className="mt-4 text-sm text-charcoal/55">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          {[
            { icon: Mail, label: t("contact.emailLabel"), value: "hello@aylamusk.com" },
            { icon: Clock, label: t("contact.hoursLabel"), value: t("contact.hoursValue") },
            { icon: MapPin, label: t("contact.studioLabel"), value: t("contact.studioValue") },
          ].map((item) => (
            <div key={item.label} className="flex gap-4">
              <item.icon size={20} className="mt-0.5 shrink-0 text-deep-rose" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">{item.label}</p>
                <p className="mt-1 text-sm text-charcoal/75">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-blush-soft/60 p-10 text-center">
            <p className="font-display text-xl text-charcoal">{t("contact.thankYou")} {form.name.split(" ")[0]}</p>
            <p className="mt-2 text-sm text-charcoal/55">{t("contact.receivedBody")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={t("contact.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label={t("contact.email")} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <Input label={t("contact.subject")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea label={t("contact.message")} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <Button type="submit" size="lg" className="w-full sm:w-auto">{t("contact.send")}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
