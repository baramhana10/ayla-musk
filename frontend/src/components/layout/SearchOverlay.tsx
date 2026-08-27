"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search } from "lucide-react";
import { productsApi } from "@/lib/api";
import { minPrice } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { useT } from "@/store/locale";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the field only on the close transition, not during render
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears stale results when the query is emptied
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      productsApi
        .list({ search: q, limit: 6 })
        .then((res) => setResults(res.products))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-24 w-[92%] max-w-xl rounded-2xl bg-ivory p-2 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-charcoal/10 px-4 py-3">
              <Search size={18} className="text-charcoal/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("shop.searchPlaceholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-charcoal/35"
              />
              <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className={cn("max-h-[60vh] overflow-y-auto", results.length > 0 && "py-2")}>
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-blush/50 transition-colors"
                >
                  <div>
                    <p className="font-display text-sm text-charcoal">{p.name}</p>
                    <p className="text-xs text-charcoal/45">{p.scentFamily}</p>
                  </div>
                  <span className="text-xs text-charcoal/60">{formatPrice(minPrice(p))}</span>
                </Link>
              ))}
              {query.trim() && !searching && results.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-charcoal/45">
                  {t("shop.noSearchResults")} “{query}”
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
