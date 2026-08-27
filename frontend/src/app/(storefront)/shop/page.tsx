import { Suspense } from "react";
import ShopContent from "./ShopContent";

export const metadata = {
  title: "تسوّقي كل العطور",
  description: "تصفّحي مجموعة أيلا مَسك الكاملة من العطر الفرنسي، زيوت العطور، بخاخات الجسم، وأطقم الهدايا.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-24 text-center text-charcoal/40">جارٍ تحميل المجموعة…</div>}>
      <ShopContent />
    </Suspense>
  );
}
