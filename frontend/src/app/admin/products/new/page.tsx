"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useT } from "@/store/locale";

export default function NewProductPage() {
  const t = useT();
  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">{t("admin.products.newTitle")}</h1>
      <p className="mt-1 text-sm text-charcoal/50">{t("admin.products.newSubtitle")}</p>
      <div className="mt-8 max-w-3xl">
        <ProductForm />
      </div>
    </div>
  );
}
