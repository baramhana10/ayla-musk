"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/hooks";
import { useCartDetails } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useHasMounted } from "@/lib/useHasMounted";
import { useT } from "@/store/locale";
import { DEPARTMENTS, departmentHref } from "@/lib/departments";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useHasMounted();
  const { data: categories } = useCategories();
  const { count } = useCartDetails();
  const wishlistCount = useWishlistStore((s) => s.slugs.length);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  const navLinks = [
    { href: "/shop", label: t("nav.shopAll") },
    ...DEPARTMENTS.map((d) => ({ href: departmentHref(d.slug), label: t(d.titleKey) })),
    { href: "/about", label: t("nav.about") },
  ];

  function isActiveLink(href: string) {
    const [targetPath, targetQuery] = href.split("?");
    // `usePathname` keeps this persistent header statically renderable. The
    // department links intentionally retain their quiet resting state on the
    // shop route, while the route-level links show the current page clearly.
    return pathname === targetPath && !targetQuery;
  }

  useEffect(() => {
    // On the homepage the bar rides over a full-height noir hero, so it must
    // not flip to solid ivory the moment the announcement bar scrolls away —
    // it holds its inverted palette until the hero itself is nearly past.
    const onScroll = () => {
      const threshold = isHome ? window.innerHeight * 0.75 : 12;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  // The homepage opens on a full-bleed noir hero, so the bar rides over it in
  // an inverted palette and only materialises into the solid ivory chrome once
  // the visitor has scrolled past that first screen.
  const overHero = isHome && !scrolled;
  const ink = overHero ? "text-ivory/75 hover:text-champagne-light" : "text-charcoal/70 hover:text-deep-rose";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          overHero
            ? "bg-transparent"
            : scrolled
              ? "bg-ivory/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(43,33,31,0.07)]"
              : "bg-ivory"
        )}
      >
        <div className="container-luxe flex h-20 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <button
            className={cn("flex items-center lg:hidden cursor-pointer transition-colors duration-500", ink)}
            aria-label={t("nav.openMenu")}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <nav className="hidden lg:flex items-center gap-8 justify-self-start">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                aria-current={isActiveLink(l.href) ? "page" : undefined}
                className={cn(
                  "text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 link-draw",
                  isActiveLink(l.href) ? (overHero ? "text-champagne-light" : "text-deep-rose") : ink
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="justify-self-center select-none">
            <span
              className={cn(
                "font-display text-2xl tracking-[0.24em] transition-colors duration-500 sm:text-[26px]",
                overHero ? "text-ivory" : "text-charcoal"
              )}
            >
              AYLA <span className={overHero ? "text-gold" : "text-deep-rose"}>MUSK</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 justify-self-end">
            <LanguageToggle tone={overHero ? "inverted" : "default"} className="mr-1 hidden sm:flex" />
            <button
              aria-label={t("nav.search")}
              onClick={() => setSearchOpen(true)}
              className={cn("hidden sm:flex h-10 w-10 items-center justify-center transition-colors duration-500 cursor-pointer", ink)}
            >
              <Search size={19} />
            </button>
            <Link
              href="/wishlist"
              aria-label={t("nav.wishlist")}
              className={cn("relative flex h-10 w-10 items-center justify-center transition-colors duration-500", ink)}
            >
              <Heart size={19} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute end-0.5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[9px] font-medium text-noir">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              aria-label={t("nav.cart")}
              onClick={() => setCartOpen(true)}
              className={cn("relative flex h-10 w-10 items-center justify-center transition-colors duration-500 cursor-pointer", ink)}
            >
              <ShoppingBag size={19} />
              {mounted && count > 0 && (
                <span className="absolute end-0.5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[9px] font-medium text-noir">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} links={navLinks} categories={categories} />
    </>
  );
}
