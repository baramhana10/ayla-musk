"use client";

import { useLocaleStore } from "@/store/locale";
import { cn } from "@/lib/utils";

/** Compact AR/EN switch. `tone` mirrors the two ink states Navbar already
 *  uses over the noir hero vs. the solid ivory chrome. */
export default function LanguageToggle({
  tone = "default",
  className,
}: {
  tone?: "default" | "inverted";
  className?: string;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className={cn(
        "flex h-8 items-center gap-1 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors duration-500 cursor-pointer",
        tone === "inverted"
          ? "border-ivory/25 text-ivory/75 hover:border-champagne-light hover:text-champagne-light"
          : "border-charcoal/20 text-charcoal/60 hover:border-deep-rose hover:text-deep-rose",
        className
      )}
    >
      <span className={locale === "ar" ? "opacity-100" : "opacity-40"}>ع</span>
      <span className="opacity-30">/</span>
      <span className={locale === "en" ? "opacity-100" : "opacity-40"}>EN</span>
    </button>
  );
}
