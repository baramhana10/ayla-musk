"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import { productsApi, ApiClientError } from "@/lib/api";
import type { Product, Department } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { minPrice } from "@/lib/mock-data";
import { DEPARTMENTS } from "@/lib/departments";
import ProductThumb from "@/components/product/ProductThumb";
import { buttonVariants } from "@/components/ui/Button";
import { useT } from "@/store/locale";

export default function AdminProductsPage() {
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    productsApi.list().then((res) => setProducts(res.products)).finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load calls setLoading synchronously inside load()
  useEffect(load, []);

  if (loading) return null;

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) && (department === "all" || p.department === department)
  );

  async function handleDelete(id: string, name: string) {
    try {
      await productsApi.remove(id);
      toast.success(`${name} ${t("admin.products.deleted")}`);
      setProducts((ps) => ps.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.products.deleteError"));
    }
    setConfirmId(null);
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      const { product } = await productsApi.duplicate(id);
      toast.success(`${product.name} ${t("admin.products.duplicated")}`);
      setProducts((ps) => [product, ...ps]);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("admin.products.duplicateError"));
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{t("admin.products.title")}</h1>
          <p className="mt-1 text-sm text-charcoal/50">{products.length} {t("admin.products.subtitle")}</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: "md" })}>
          <Plus size={15} /> {t("admin.products.addProduct")}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.products.searchPlaceholder")}
            className="h-10 w-full rounded-full border border-charcoal/15 bg-ivory ps-9 pe-4 text-sm outline-none focus:border-deep-rose"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDepartment("all")}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs transition-colors cursor-pointer",
              department === "all" ? "border-deep-rose bg-deep-rose text-ivory" : "border-charcoal/15 text-charcoal/60 hover:border-deep-rose"
            )}
          >
            {t("admin.products.allDepartments")}
          </button>
          {DEPARTMENTS.map((d) => (
            <button
              key={d.slug}
              onClick={() => setDepartment(d.slug)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-colors cursor-pointer",
                department === d.slug ? "border-deep-rose bg-deep-rose text-ivory" : "border-charcoal/15 text-charcoal/60 hover:border-deep-rose"
              )}
            >
              <d.icon size={12} /> {t(d.titleKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-charcoal/10 bg-ivory">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-start text-xs uppercase tracking-[0.08em] text-charcoal/45">
              <th className="px-5 py-3">{t("admin.products.product")}</th>
              <th className="px-5 py-3">{t("admin.products.department")}</th>
              <th className="px-5 py-3">{t("admin.products.price")}</th>
              <th className="px-5 py-3">{t("admin.products.stock")}</th>
              <th className="px-5 py-3">{t("admin.products.rating")}</th>
              <th className="px-5 py-3 text-end">{t("admin.products.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {filtered.map((p) => {
              const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              const dept = DEPARTMENTS.find((d) => d.slug === p.department);
              return (
                <tr key={p.id} className="hover:bg-blush-soft/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ProductThumb src={p.images[0]} alt={p.name} accent={p.accent} className="h-10 w-8 shrink-0" />
                      <span className="font-medium text-charcoal">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {dept && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-2.5 py-1 text-[11px] text-deep-rose">
                        <dept.icon size={11} /> {t(dept.titleKey)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-charcoal/70">{formatPrice(minPrice(p))}</td>
                  <td className={cn("px-5 py-3", stock <= 10 ? "text-wine" : "text-charcoal/70")}>{stock}</td>
                  <td className="px-5 py-3 text-charcoal/60">{p.rating.toFixed(1)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(p.id)}
                        disabled={duplicatingId === p.id}
                        aria-label={t("admin.products.duplicate")}
                        className="rounded-lg p-2 text-charcoal/50 hover:bg-blush hover:text-deep-rose cursor-pointer disabled:opacity-40"
                      >
                        <Copy size={14} />
                      </button>
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 text-charcoal/50 hover:bg-blush hover:text-deep-rose cursor-pointer">
                        <Pencil size={14} />
                      </Link>
                      {confirmId === p.id ? (
                        <button onClick={() => handleDelete(p.id, p.name)} className="rounded-lg bg-wine px-2 py-1 text-xs text-ivory cursor-pointer">
                          {t("common.confirm")}
                        </button>
                      ) : (
                        <button onClick={() => setConfirmId(p.id)} className="rounded-lg p-2 text-charcoal/50 hover:bg-blush hover:text-wine cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-sm text-charcoal/45">{t("admin.products.noProducts")}</p>}
      </div>
    </div>
  );
}
