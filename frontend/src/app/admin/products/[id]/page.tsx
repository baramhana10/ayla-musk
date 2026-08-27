"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import { buttonVariants } from "@/components/ui/Button";
import { useT } from "@/store/locale";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    productsApi
      .list()
      .then((res) => setProduct(res.products.find((p) => p.id === id) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-charcoal">{t("admin.products.notFound")}</p>
        <Link href="/admin/products" className={buttonVariants({ className: "mt-6" })}>{t("admin.products.backToProducts")}</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">{t("admin.products.editTitle")}</h1>
      <p className="mt-1 text-sm text-charcoal/50">{product.name}</p>
      <div className="mt-8 max-w-3xl">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
