"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "@/lib/i18n/en";
import { ar } from "@/lib/i18n/ar";

export type Locale = "ar" | "en";

const dictionaries = { en, ar };

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

/**
 * Arabic is the storefront default (matches the audience this brand's real
 * packaging is already printed for); English is available as a toggle. The
 * root layout renders `<html lang="ar" dir="rtl">` unconditionally at SSR
 * time to match, so first-time visitors get the correct direction with zero
 * flash. Only a returning visitor who previously chose English sees the
 * brief correction once <LocaleSync/> rehydrates their saved preference —
 * an accepted trade-off for not needing cookie-based SSR locale detection.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "ar",
      setLocale: (l) => set({ locale: l }),
    }),
    { name: "ayla-locale" }
  )
);

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** `t("shop.title")` — reactive to the current locale. Falls back to the
 *  raw key (visibly broken, easy to spot) if a path is ever mistyped. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const dict = dictionaries[locale];
  return (path: string): string => {
    const value = getPath(dict, path);
    return typeof value === "string" ? value : path;
  };
}

export function useLocale() {
  return useLocaleStore((s) => s.locale);
}
