"use client";

import { useCategories } from "@/lib/hooks";
import type { ScentFamily, Department } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";
import { DEPARTMENTS, CATEGORY_SLUGS_BY_DEPARTMENT } from "@/lib/departments";

const scentFamilies: ScentFamily[] = [
  "Floral Musk",
  "Oriental Amber",
  "Fresh Clean",
  "Sweet Gourmand",
  "Fruity Floral",
];

export interface ShopFilters {
  department: Department | null;
  category: string | null;
  scentFamilies: ScentFamily[];
  maxPrice: number;
  inStockOnly: boolean;
}

export const PRICE_CEILING = 25000;

export default function FilterSidebar({
  filters,
  onChange,
  className,
}: {
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
  className?: string;
}) {
  const { data: categories } = useCategories();
  const t = useT();

  const visibleCategories = filters.department
    ? categories.filter((c) => CATEGORY_SLUGS_BY_DEPARTMENT[filters.department!].includes(c.slug))
    : categories;
  const showCategoryFilter = filters.department !== "lenses";
  const showScentFamilyFilter = filters.department === "perfumes" || filters.department === null;

  function toggleFamily(f: ScentFamily) {
    onChange({
      ...filters,
      scentFamilies: filters.scentFamilies.includes(f)
        ? filters.scentFamilies.filter((x) => x !== f)
        : [...filters.scentFamilies, f],
    });
  }

  function setDepartment(d: Department | null) {
    // Switching department invalidates the previous sub-category and, for
    // lenses, the scent-family selection — carrying either forward would
    // silently filter the grid to zero results with no visible reason why.
    onChange({ ...filters, department: d, category: null, scentFamilies: d === "lenses" ? [] : filters.scentFamilies });
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">{t("filters.department")}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setDepartment(null)}
            className={cn(
              "text-start text-sm py-1 transition-colors cursor-pointer",
              !filters.department ? "text-deep-rose font-medium" : "text-charcoal/65 hover:text-deep-rose"
            )}
          >
            {t("filters.allProducts")}
          </button>
          {DEPARTMENTS.map((d) => (
            <button
              key={d.slug}
              onClick={() => setDepartment(d.slug)}
              className={cn(
                "text-start text-sm py-1 transition-colors cursor-pointer",
                filters.department === d.slug ? "text-deep-rose font-medium" : "text-charcoal/65 hover:text-deep-rose"
              )}
            >
              {t(d.titleKey)}
            </button>
          ))}
        </div>
      </div>

      {showCategoryFilter && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">{t("filters.category")}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onChange({ ...filters, category: null })}
              className={cn(
                "text-start text-sm py-1 transition-colors cursor-pointer",
                !filters.category ? "text-deep-rose font-medium" : "text-charcoal/65 hover:text-deep-rose"
              )}
            >
              {t("filters.allProducts")}
            </button>
            {visibleCategories.map((c) => (
              <button
                key={c.slug}
                onClick={() => onChange({ ...filters, category: c.slug })}
                className={cn(
                  "text-start text-sm py-1 transition-colors cursor-pointer",
                  filters.category === c.slug ? "text-deep-rose font-medium" : "text-charcoal/65 hover:text-deep-rose"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showScentFamilyFilter && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">{t("filters.scentFamily")}</p>
          <div className="flex flex-col gap-2.5">
            {scentFamilies.map((f) => (
              <label key={f} className="flex items-center gap-2.5 text-sm text-charcoal/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.scentFamilies.includes(f)}
                  onChange={() => toggleFamily(f)}
                  className="h-4 w-4 rounded border-charcoal/25 text-deep-rose accent-[#9c5a63] cursor-pointer"
                />
                {t(`filters.families.${f}`)}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
          {t("filters.maxPrice")} — ₪{Math.round(filters.maxPrice / 100)}
        </p>
        <input
          type="range"
          min={2000}
          max={PRICE_CEILING}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[#9c5a63] cursor-pointer"
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-charcoal/70 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          className="h-4 w-4 rounded border-charcoal/25 accent-[#9c5a63] cursor-pointer"
        />
        {t("filters.inStockOnly")}
      </label>

      <button
        onClick={() => onChange({ department: filters.department, category: null, scentFamilies: [], maxPrice: PRICE_CEILING, inStockOnly: false })}
        className="text-xs text-charcoal/45 underline underline-offset-4 hover:text-deep-rose cursor-pointer"
      >
        {t("filters.resetFilters")}
      </button>
    </div>
  );
}
