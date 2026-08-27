"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi, type OrderDto } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { useT, useLocale } from "@/store/locale";

export default function AdminOrdersPage() {
  const t = useT();
  const locale = useLocale();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list().then((res) => setOrders(res.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">{t("admin.orders.title")}</h1>
      <p className="mt-1 text-sm text-charcoal/50">{orders.length} {t("admin.orders.subtitle")}</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-charcoal/10 bg-ivory">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-start text-xs uppercase tracking-[0.08em] text-charcoal/45">
              <th className="px-5 py-3">{t("admin.orders.order")}</th>
              <th className="px-5 py-3">{t("admin.orders.customer")}</th>
              <th className="px-5 py-3">{t("admin.orders.date")}</th>
              <th className="px-5 py-3">{t("admin.orders.status")}</th>
              <th className="px-5 py-3 text-end">{t("admin.orders.total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-blush-soft/40">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-charcoal hover:text-deep-rose">#{o.id}</Link>
                </td>
                <td className="px-5 py-3 text-charcoal/65">{o.shippingAddress.fullName}</td>
                <td className="px-5 py-3 text-charcoal/50">{new Date(o.createdAt).toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-US")}</td>
                <td className="px-5 py-3"><Badge variant="outline">{t(`admin.orders.status${o.status.charAt(0).toUpperCase()}${o.status.slice(1)}`)}</Badge></td>
                <td className="px-5 py-3 text-end text-charcoal/70">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-charcoal/45">{t("admin.orders.noOrders")}</p>}
      </div>
    </div>
  );
}
