"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { useT, useLocale } from "@/store/locale";
import LanguageToggle from "./LanguageToggle";

export default function MobileMenu({
  open,
  onClose,
  links,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  categories: Category[];
}) {
  const t = useT();
  const locale = useLocale();
  const off = locale === "ar" ? "100%" : "-100%";

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
            initial={{ x: off }}
            animate={{ x: 0 }}
            exit={{ x: off }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 start-0 z-50 flex w-[86%] max-w-sm flex-col bg-ivory shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <span className="font-display text-xl tracking-[0.15em]">AYLA MUSK</span>
              <button onClick={onClose} aria-label={t("common.close")} className="text-charcoal/60 cursor-pointer">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between border-b border-charcoal/8 py-4 font-display text-lg text-charcoal"
                  >
                    {l.label}
                    <ChevronRight size={16} className="text-charcoal/30 rtl:-scale-x-100" />
                  </Link>
                ))}
              </nav>

              <p className="mt-8 mb-3 text-[11px] uppercase tracking-[0.2em] text-charcoal/40">{t("pillars.eyebrow")}</p>
              <div className="flex flex-col gap-1">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?category=${c.slug}`}
                    onClick={onClose}
                    className="py-2 text-sm text-charcoal/70 hover:text-deep-rose transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-charcoal/10 px-6 py-5">
              <Link href="/wishlist" onClick={onClose} className="flex items-center gap-2 text-sm text-charcoal/70">
                <Heart size={17} /> {t("nav.wishlist")}
              </Link>
              <LanguageToggle className="ms-auto" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
