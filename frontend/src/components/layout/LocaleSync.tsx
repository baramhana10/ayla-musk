"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/locale";

/**
 * Keeps <html lang/dir> in sync with the locale store. The server always
 * renders lang="ar" dir="rtl" (the default), so this only ever has to
 * *correct* the DOM for a returning visitor whose saved preference is
 * English — everyone else never sees this run change anything.
 */
export default function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
