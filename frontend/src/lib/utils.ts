import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ILS",
  }).format(cents / 100);
}

/** A variant's display label — its free-form `label` (lens power, pack size…)
 *  when set, else its size in ml, else the given fallback (typically the
 *  translated "Gift Set" string) for variants with neither. */
export function variantLabel(v: { label?: string; sizeMl?: number }, fallback: string) {
  if (v.label) return v.label;
  if (v.sizeMl) return `${v.sizeMl}ml`;
  return fallback;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
