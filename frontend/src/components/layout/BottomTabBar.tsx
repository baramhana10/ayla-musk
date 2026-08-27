"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartDetails } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useHasMounted } from "@/lib/useHasMounted";
import { useT } from "@/store/locale";
import CategoriesSheet from "./CategoriesSheet";

/**
 * App-like fast navigation for small screens — a fixed bottom tab bar,
 * hidden from `lg` up where the full navbar already covers this. Kept in the
 * site's standing ivory/charcoal/champagne chrome (not the homepage's warm
 * reskin) since it's persistent across every route, the same way the navbar
 * and footer are.
 */
export default function BottomTabBar() {
  const t = useT();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const { count } = useCartDetails();
  const wishlistCount = useWishlistStore((s) => s.slugs.length);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const tabs = [
    { key: "home", href: "/", icon: Home, label: t("bottomNav.home"), exact: true },
    { key: "categories", icon: LayoutGrid, label: t("bottomNav.categories"), action: () => setCategoriesOpen(true) },
    { key: "favorites", href: "/wishlist", icon: Heart, label: t("bottomNav.favorites"), badge: wishlistCount },
    { key: "cart", icon: ShoppingBag, label: t("bottomNav.cart"), badge: count, action: () => setCartOpen(true) },
  ] as const;

  return (
    <>
      <nav
        aria-label={t("bottomNav.label")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-ivory/95 backdrop-blur-xl [padding-bottom:env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {tabs.map((tab) => {
            const isExact = "exact" in tab && tab.exact;
            const active =
              "href" in tab && tab.href
                ? isExact
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href)
                : tab.key === "categories" && pathname === "/shop";
            const badge = mounted && "badge" in tab ? tab.badge : 0;
            const content = (
              <div className="relative flex flex-col items-center gap-1">
                <span className="relative">
                  <tab.icon size={21} strokeWidth={active ? 2.3 : 1.8} className={cn("transition-colors", active ? "text-deep-rose" : "text-charcoal/55")} />
                  {badge > 0 && (
                    <span className="absolute -end-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[9px] font-medium text-noir">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                <span className={cn("text-[10px] tracking-[0.02em] transition-colors", active ? "text-deep-rose font-medium" : "text-charcoal/50")}>
                  {tab.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="bottom-tab-active"
                    className="absolute -top-2.5 h-0.5 w-8 rounded-full bg-deep-rose"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </div>
            );

            if ("action" in tab) {
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={tab.action}
                  className="flex flex-1 cursor-pointer items-center justify-center py-2.5"
                  aria-label={tab.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={tab.key} href={tab.href} className="flex flex-1 items-center justify-center py-2.5" aria-label={tab.label}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      <CategoriesSheet open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
}
