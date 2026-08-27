"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ordersApi, type OrderDto } from "@/lib/api";
import { formatPrice, variantLabel } from "@/lib/utils";
import ProductThumb from "@/components/product/ProductThumb";
import Select from "@/components/ui/Select";
import { buttonVariants } from "@/components/ui/Button";
import { useT, useLocale } from "@/store/locale";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const locale = useLocale();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(id).then((res) => setOrder(res.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl text-charcoal">{t("admin.orders.notFound")}</p>
        <Link href="/admin/orders" className={buttonVariants({ className: "mt-6" })}>{t("admin.orders.backToOrders")}</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-charcoal/45 hover:text-deep-rose">{locale === "ar" ? "→" : "←"} {t("admin.orders.backToOrders")}</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-charcoal">{t("admin.orders.order")} #{order.id}</h1>
        <Select
          value={order.status}
          onChange={async (e) => {
            const status = e.target.value as OrderDto["status"];
            try {
              const { order: updated } = await ordersApi.updateStatus(order.id, status);
              setOrder(updated);
              toast.success(`${t("admin.orders.statusUpdated")} ${t(`admin.orders.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)}`);
            } catch {
              toast.error(t("admin.orders.statusUpdateError"));
            }
          }}
          className="w-44"
        >
          <option value="processing">{t("admin.orders.statusProcessing")}</option>
          <option value="shipped">{t("admin.orders.statusShipped")}</option>
          <option value="delivered">{t("admin.orders.statusDelivered")}</option>
        </Select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-ivory p-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <ProductThumb src={item.image} alt={item.productName} accent={item.accent} className="h-16 w-12 shrink-0" />
              <div className="flex-1">
                <p className="font-display text-sm text-charcoal">{item.productName}</p>
                <p className="text-xs text-charcoal/45">{variantLabel(item, t("common.giftSet"))} × {item.quantity}</p>
              </div>
              <span className="text-sm text-charcoal/70">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-blush-soft/60 p-5 text-sm">
            <div className="flex justify-between text-charcoal/60"><span>{t("admin.orders.subtotal")}</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-charcoal/60"><span>{t("admin.orders.discount")}</span><span>-{formatPrice(order.discount)}</span></div>
            <div className="mt-2 flex justify-between text-charcoal/60"><span>{t("admin.orders.shipping")}</span><span>{formatPrice(order.shipping)}</span></div>
            <div className="mt-3 flex justify-between border-t border-charcoal/10 pt-3 text-base font-medium text-charcoal"><span>{t("admin.orders.total")}</span><span>{formatPrice(order.total)}</span></div>
          </div>
          <div className="rounded-2xl border border-charcoal/10 p-5 text-sm">
            <p className="mb-2 font-medium text-charcoal">{t("admin.orders.customerLabel")}</p>
            <p className="text-charcoal/60 leading-relaxed">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.phone}
            </p>
          </div>
          <div className="rounded-2xl border border-charcoal/10 p-5 text-sm">
            <p className="mb-2 font-medium text-charcoal">{t("admin.orders.shippingAddress")}</p>
            <p className="text-charcoal/60 leading-relaxed">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}
            </p>
          </div>
          <div className="rounded-2xl border border-charcoal/10 bg-blush/40 p-5 text-sm">
            <p className="mb-1 font-medium text-charcoal">{t("admin.orders.paymentLabel")}</p>
            <p className="text-deep-rose">{t("admin.orders.cod")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
