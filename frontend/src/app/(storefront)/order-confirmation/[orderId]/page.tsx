"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLastOrderStore } from "@/store/lastOrder";
import { ordersApi, type OrderDto } from "@/lib/api";
import { formatPrice, variantLabel } from "@/lib/utils";
import ProductThumb from "@/components/product/ProductThumb";
import { buttonVariants } from "@/components/ui/Button";
import PetalField from "@/components/home/PetalField";
import { useT, useLocale } from "@/store/locale";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const cachedOrder = useLastOrderStore((s) => s.order);
  const t = useT();
  const locale = useLocale();
  const [order, setOrder] = useState<OrderDto | null>(cachedOrder?.id === orderId ? cachedOrder : null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">(order ? "ready" : "loading");

  useEffect(() => {
    if (order) return;
    let cancelled = false;
    ordersApi
      .get(orderId)
      .then((res) => {
        if (!cancelled) {
          setOrder(res.order);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (status === "loading") return <div className="container-luxe py-24" />;

  if (status === "not-found" || !order) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-3xl text-charcoal">{t("orderConfirmation.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-charcoal/50">
          {t("orderConfirmation.notFoundBody")}
        </p>
        <Link href="/shop" className={buttonVariants({ size: "lg", className: "mt-8" })}>{t("orderConfirmation.continueShopping")}</Link>
      </div>
    );
  }

  const estDelivery = new Date(order.createdAt);
  estDelivery.setDate(estDelivery.getDate() + 5);

  return (
    <div className="relative overflow-hidden">
      <PetalField count={10} />
      <div className="container-luxe relative py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-deep-rose/10"
          >
            <CheckCircle2 size={32} className="text-deep-rose" />
          </motion.div>
          <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.2em] text-deep-rose">{t("orderConfirmation.confirmed")}</span>
          <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">{t("orderConfirmation.thankYou")} {order.shippingAddress.fullName.split(" ")[0]}</h1>
          <p className="mt-4 text-sm text-charcoal/55">
            {t("orderConfirmation.orderNumber")} <span className="font-medium text-charcoal">#{order.id}</span> {t("orderConfirmation.placedBody")} {order.shippingAddress.city}. {t("orderConfirmation.estDelivery")}{" "}
            {estDelivery.toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-US", { month: "long", day: "numeric" })}.
          </p>
          <p className="mt-2 text-sm font-medium text-deep-rose">{t("orderConfirmation.codReminder")}</p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-blush-soft/60 p-6 sm:p-8">
          <div className="divide-y divide-charcoal/10">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <ProductThumb src={item.image} alt={item.productName} accent={item.accent} className="h-16 w-12 shrink-0" />
                <div className="flex-1">
                  <p className="font-display text-sm text-charcoal">{item.productName}</p>
                  <p className="text-xs text-charcoal/45">{variantLabel(item, t("common.giftSet"))} × {item.quantity}</p>
                </div>
                <span className="text-sm text-charcoal/70">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
            <div className="flex justify-between text-charcoal/60"><span>{t("cart.subtotal")}</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-deep-rose"><span>{t("cart.discount")}</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-charcoal/60"><span>{t("cart.shipping")}</span><span>{order.shipping === 0 ? t("common.free") : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between border-t border-charcoal/10 pt-2 text-base font-medium text-charcoal"><span>{t("cart.total")}</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/shop" className={buttonVariants({ size: "lg" })}>{t("orderConfirmation.continueShopping")}</Link>
        </div>
      </div>
    </div>
  );
}
