"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";
import { DEPARTMENTS, departmentHref } from "@/lib/departments";

/**
 * The bottom tab bar's "Categories" tab opens this sheet rather than
 * navigating directly — with only 3 departments, a full intermediate screen
 * gives each one room to breathe (icon, name, one-line pitch) and shows
 * which one is currently active, instead of guessing from a bare label.
 */
export default function CategoriesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeDepartment = pathname === "/shop" ? searchParams.get("department") : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-ivory pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 shadow-2xl lg:hidden"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-charcoal/15" />
            <div className="flex items-center justify-between px-6">
              <span className="font-display text-lg text-charcoal">{t("pillars.eyebrow")}</span>
              <button onClick={onClose} aria-label={t("common.close")} className="text-charcoal/50 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 px-4">
              {DEPARTMENTS.map((d) => {
                const active = activeDepartment === d.slug;
                return (
                  <Link
                    key={d.slug}
                    href={departmentHref(d.slug)}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
                      active ? "border-deep-rose bg-blush-soft/60" : "border-charcoal/10 hover:border-deep-rose/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
                        active ? "bg-deep-rose text-ivory" : "bg-blush text-deep-rose"
                      )}
                    >
                      <d.icon size={19} />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-base text-charcoal">{t(d.titleKey)}</span>
                      <span className="block text-xs text-charcoal/50">{t(d.tagKey)}</span>
                    </span>
                    {active ? (
                      <Check size={18} className="shrink-0 text-deep-rose" />
                    ) : (
                      <ArrowUpRight size={16} className="shrink-0 text-charcoal/30 rtl:-scale-x-100" />
                    )}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/shop"
              onClick={onClose}
              className="mx-4 mt-4 block rounded-2xl border border-dashed border-charcoal/15 p-4 text-center text-sm text-charcoal/60 hover:border-deep-rose hover:text-deep-rose transition-colors"
            >
              {t("filters.allProducts")}
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
