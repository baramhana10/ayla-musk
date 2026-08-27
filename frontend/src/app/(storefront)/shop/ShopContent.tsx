"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search as SearchIcon } from "lucide-react";
import { minPrice } from "@/lib/mock-data";
import { useProducts } from "@/lib/hooks";
import type { Department } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import FilterSidebar, { type ShopFilters, PRICE_CEILING } from "@/components/shop/FilterSidebar";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useT, useLocale } from "@/store/locale";
import { DEPARTMENTS } from "@/lib/departments";

type SortKey = "featured" | "bestselling" | "price-asc" | "price-desc" | "rating";

const PAGE_SIZE = 12;

export default function ShopContent() {
  const searchParams = useSearchParams();
  const urlDepartment = (searchParams.get("department") as Department | null) ?? null;
  // Fetched unfiltered and department/category/scent filtered client-side
  // alongside every other filter below — keeps a single source of truth
  // (the `filters` state) instead of the URL and the filter panel each
  // driving a different, potentially inconsistent fetch.
  const { data: products, loading } = useProducts();
  const t = useT();
  const locale = useLocale();
  const isArabic = locale === "ar";

  const [filters, setFilters] = useState<ShopFilters>({
    department: urlDepartment,
    category: searchParams.get("category"),
    scentFamilies: [],
    maxPrice: PRICE_CEILING,
    inStockOnly: false,
  });
  const [sort, setSort] = useState<SortKey>((searchParams.get("sort") as SortKey) || "featured");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Keep the department/category filters in sync with the URL (e.g. nav
  // links to /shop?department=x or /shop?category=x) using React's "adjust
  // state during render" pattern instead of an effect, so it never causes an
  // extra commit.
  const urlCategory = searchParams.get("category");
  const [trackedUrl, setTrackedUrl] = useState({ department: urlDepartment, category: urlCategory });
  if (trackedUrl.department !== urlDepartment || trackedUrl.category !== urlCategory) {
    setTrackedUrl({ department: urlDepartment, category: urlCategory });
    setFilters((f) => ({ ...f, department: urlDepartment, category: urlCategory }));
  }

  const paginationKey = JSON.stringify(filters) + sort + search;
  const [trackedPaginationKey, setTrackedPaginationKey] = useState(paginationKey);
  if (paginationKey !== trackedPaginationKey) {
    setTrackedPaginationKey(paginationKey);
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.scentFamilies.length && (!p.scentFamily || !filters.scentFamilies.includes(p.scentFamily))) return false;
      if (minPrice(p) > filters.maxPrice) return false;
      if (filters.inStockOnly && !p.variants.some((v) => v.stock > 0)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesScent = p.scentFamily?.toLowerCase().includes(q) ?? false;
        const matchesLens = p.lensType?.toLowerCase().includes(q) || p.lensColor?.toLowerCase().includes(q) || false;
        if (!p.name.toLowerCase().includes(q) && !matchesScent && !matchesLens && !p.shortDescription.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });

    switch (sort) {
      case "bestselling":
        list = [...list].sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.reviewCount - a.reviewCount);
        break;
      case "price-asc":
        list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, filters, sort, search]);

  const visible = filtered.slice(0, visibleCount);
  const activeDepartment = filters.department ? DEPARTMENTS.find((d) => d.slug === filters.department) : undefined;
  const activeChips = [
    ...(activeDepartment
      ? [{ key: "department", label: t(activeDepartment.titleKey), onRemove: () => setFilters((s) => ({ ...s, department: null, category: null })) }]
      : []),
    ...filters.scentFamilies.map((f) => ({ key: f, label: t(`filters.families.${f}`), onRemove: () => setFilters((s) => ({ ...s, scentFamilies: s.scentFamilies.filter((x) => x !== f) })) })),
    ...(filters.inStockOnly ? [{ key: "stock", label: t("shop.inStockOnly"), onRemove: () => setFilters((s) => ({ ...s, inStockOnly: false })) }] : []),
  ];

  return (
    <div className="container-luxe py-10 sm:py-14">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">{t("shop.eyebrow")}</span>
        <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">
          {activeDepartment ? t(activeDepartment.titleKey) : t("shop.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-charcoal/55">
          {loading ? t("shop.loadingCollection") : `${filtered.length} ${filtered.length === 1 ? t("shop.countScent") : t("shop.countScents")} ${t("shop.crafted")}`}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="h-11 w-full rounded-full border border-charcoal/15 bg-ivory ps-10 pe-4 text-sm outline-none focus:border-deep-rose"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex h-11 items-center gap-2 rounded-full border border-charcoal/15 px-4 text-sm text-charcoal/70 lg:hidden cursor-pointer"
          >
            <SlidersHorizontal size={14} /> {t("shop.filters")}
          </button>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-11 w-44">
            <option value="featured">{t("shop.sortFeatured")}</option>
            <option value="bestselling">{t("shop.sortBestselling")}</option>
            <option value="rating">{t("shop.sortTopRated")}</option>
            <option value="price-asc">{t("shop.sortPriceAsc")}</option>
            <option value="price-desc">{t("shop.sortPriceDesc")}</option>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button key={chip.key} onClick={chip.onRemove} className="cursor-pointer">
              <Badge variant="outline" className="flex items-center gap-1.5 pe-2">
                {chip.label} <X size={11} />
              </Badge>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} className="sticky top-28" />
        </aside>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: isArabic ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: isArabic ? "100%" : "-100%" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-y-0 start-0 z-50 w-[85%] max-w-xs overflow-y-auto bg-ivory p-6 lg:hidden"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-display text-lg">{t("shop.filters")}</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="cursor-pointer text-charcoal/50">
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar filters={filters} onChange={setFilters} />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-8 w-full rounded-full bg-deep-rose py-3 text-sm text-ivory cursor-pointer"
                >
                  {t("shop.showResults")} {filtered.length} {t("shop.results")}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="font-display text-xl text-charcoal">{t("shop.noResultsTitle")}</p>
              <p className="text-sm text-charcoal/50">{t("shop.noResultsBody")}</p>
            </div>
          ) : (
            <div className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3")}>
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="mt-14 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-full border border-charcoal/20 px-8 py-3 text-sm text-charcoal/70 hover:border-deep-rose hover:text-deep-rose transition-colors cursor-pointer"
              >
                {t("shop.loadMore")} ({filtered.length - visibleCount} {t("shop.remaining")})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
