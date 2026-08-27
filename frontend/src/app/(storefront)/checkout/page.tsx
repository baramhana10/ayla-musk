"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { useCartDetails, useCartStore, COUPONS } from "@/store/cart";
import { useLastOrderStore } from "@/store/lastOrder";
import { ordersApi, ApiClientError } from "@/lib/api";
import { deliverySchema, type DeliveryFormValues } from "@/lib/checkoutSchema";
import { WEST_BANK_CITIES } from "@/lib/palestineCities";
import { Input, Textarea } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useHasMounted } from "@/lib/useHasMounted";
import Stepper from "./Stepper";
import OrderSummaryCard from "./OrderSummaryCard";
import { useT, useLocale } from "@/store/locale";

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const t = useT();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const enterX = isArabic ? -16 : 16;
  const exitX = isArabic ? 16 : -16;
  const { lines, subtotal } = useCartDetails();
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clear);
  const setLastOrder = useLastOrderStore((s) => s.setOrder);

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState<DeliveryFormValues | null>(null);
  const [placing, setPlacing] = useState(false);

  const coupon = couponCode ? COUPONS[couponCode] : null;
  const discount = coupon ? Math.round(subtotal * (coupon.percentOff / 100)) : 0;
  const shippingCost = subtotal >= 7500 || subtotal === 0 ? 0 : 650;
  const total = subtotal - discount + shippingCost;

  const deliveryForm = useForm<DeliveryFormValues>({ resolver: zodResolver(deliverySchema) });

  useEffect(() => {
    if (mounted && lines.length === 0 && !placing) router.replace("/cart");
  }, [mounted, lines.length, placing, router]);

  function onDeliverySubmit(values: DeliveryFormValues) {
    setDelivery(values);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePlaceOrder() {
    if (!delivery) return;
    setPlacing(true);
    try {
      const { order } = await ordersApi.create({
        items: lines.map((l) => ({ variantId: l.variant.id, quantity: l.quantity })),
        couponCode: couponCode ?? undefined,
        shippingAddress: delivery,
      });

      setLastOrder(order);
      clearCart();
      toast.success(t("checkout.orderPlaced"));
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("checkout.orderError"));
      setPlacing(false);
    }
  }

  if (!mounted || (lines.length === 0 && !placing)) return <div className="container-luxe py-24" />;

  return (
    <div className="container-luxe py-10 sm:py-14">
      <div className="mb-10">
        <Stepper current={step} />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: enterX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: exitX }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)}
                className="space-y-5"
              >
                <h2 className="font-display text-2xl text-charcoal">{t("checkout.shippingDetails")}</h2>
                <Input label={t("checkout.fullName")} {...deliveryForm.register("fullName")} error={deliveryForm.formState.errors.fullName?.message} />
                <Input label={t("checkout.phone")} type="tel" placeholder="05X-XXX-XXXX" {...deliveryForm.register("phone")} error={deliveryForm.formState.errors.phone?.message} />
                <Select label={t("checkout.city")} {...deliveryForm.register("city")} error={deliveryForm.formState.errors.city?.message}>
                  <option value="">{t("checkout.selectCity")}</option>
                  {WEST_BANK_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Textarea
                  label={t("checkout.address")}
                  rows={3}
                  placeholder={t("checkout.addressPlaceholder")}
                  {...deliveryForm.register("address")}
                  error={deliveryForm.formState.errors.address?.message}
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto">{t("checkout.reviewOrder")}</Button>
              </motion.form>
            )}

            {step === 2 && delivery && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: enterX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: exitX }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <h2 className="font-display text-2xl text-charcoal">{t("checkout.reviewYourOrder")}</h2>

                <div className="rounded-xl border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">{t("checkout.shippingTo")}</p>
                    <button onClick={() => setStep(1)} className="text-xs text-deep-rose underline underline-offset-4 cursor-pointer">{t("common.edit")}</button>
                  </div>
                  <p className="mt-2 text-sm text-charcoal/75">
                    {delivery.fullName} · {delivery.phone}<br />
                    {delivery.address}<br />
                    {delivery.city}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-blush-soft/70 px-4 py-3 text-xs text-charcoal/60">
                  <Banknote size={16} className="text-deep-rose shrink-0" />
                  {t("checkout.codNotice")}
                </div>

                <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? t("checkout.placingOrder") : `${t("checkout.placeOrderCod")} — ${new Intl.NumberFormat("en-US", { style: "currency", currency: "ILS" }).format(total / 100)}`}
                </Button>
                <p className="text-center text-[11px] text-charcoal/40">
                  {t("checkout.agreeTerms")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <OrderSummaryCard lines={lines} subtotal={subtotal} discount={discount} shipping={shippingCost} total={total} />
      </div>

      <div className="mt-10 text-center">
        <Link href="/cart" className="text-xs text-charcoal/40 hover:text-deep-rose">{isArabic ? "→" : "←"} {t("checkout.backToBag")}</Link>
      </div>
    </div>
  );
}
