"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { couponsApi, ApiClientError, type CouponDto } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useT } from "@/store/locale";

export default function AdminCouponsPage() {
  const t = useT();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CouponDto>({ code: "", label: "", percentOff: 10, active: true });
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    couponsApi.list().then((res) => setCoupons(res.coupons)).finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load calls setLoading synchronously inside load()
  useEffect(load, []);

  if (loading) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.label.trim()) {
      toast.error(t("admin.coupons.fillFields"));
      return;
    }
    try {
      await couponsApi.upsert({ ...form, code: form.code.toUpperCase() });
      toast.success(`${form.code.toUpperCase()} ${t("admin.coupons.saved")}`);
      setForm({ code: "", label: "", percentOff: 10, active: true });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.coupons.saveError"));
    }
  }

  async function handleDelete(code: string) {
    try {
      await couponsApi.remove(code);
      toast.success(`${code} ${t("admin.coupons.removed")}`);
      setCoupons((cs) => cs.filter((c) => c.code !== code));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.coupons.removeError"));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{t("admin.coupons.title")}</h1>
          <p className="mt-1 text-sm text-charcoal/50">{coupons.length} {t("admin.coupons.subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}><Plus size={15} /> {t("admin.coupons.addCoupon")}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid max-w-2xl grid-cols-1 gap-4 rounded-2xl border border-charcoal/10 bg-ivory p-6 sm:grid-cols-3">
          <Input label={t("admin.coupons.code")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="AYLA20" />
          <Input label={t("admin.coupons.description")} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="20% off" className="sm:col-span-2" />
          <Input label={t("admin.coupons.percentOff")} type="number" value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: Number(e.target.value) })} />
          <div className="sm:col-span-3">
            <Button type="submit">{t("admin.coupons.saveCoupon")}</Button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-charcoal/10 bg-ivory">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-start text-xs uppercase tracking-[0.08em] text-charcoal/45">
              <th className="px-5 py-3">{t("admin.coupons.code")}</th>
              <th className="px-5 py-3">{t("admin.coupons.description")}</th>
              <th className="px-5 py-3">{t("admin.orders.discount")}</th>
              <th className="px-5 py-3">{t("admin.coupons.status")}</th>
              <th className="px-5 py-3 text-end">{t("admin.coupons.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {coupons.map((c) => (
              <tr key={c.code} className="hover:bg-blush-soft/40">
                <td className="px-5 py-3 font-medium text-charcoal">{c.code}</td>
                <td className="px-5 py-3 text-charcoal/60">{c.label}</td>
                <td className="px-5 py-3 text-charcoal/60">{c.percentOff}%</td>
                <td className="px-5 py-3"><Badge variant={c.active ? "default" : "outline"}>{c.active ? t("admin.coupons.active") : t("admin.coupons.inactive")}</Badge></td>
                <td className="px-5 py-3 text-end">
                  <button onClick={() => handleDelete(c.code)} className="rounded-lg p-2 text-charcoal/40 hover:bg-blush hover:text-wine cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
