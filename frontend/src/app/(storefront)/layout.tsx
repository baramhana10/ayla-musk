"use client";

import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import BottomTabBar from "@/components/layout/BottomTabBar";
import { useT } from "@/store/locale";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-3 focus:text-sm focus:text-ivory"
      >
        {t("common.skipToContent")}
      </a>
      <AnnouncementBar />
      <Navbar />
      <div className="pb-16 lg:pb-0">
        <main id="main-content">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <Suspense fallback={null}>
        <BottomTabBar />
      </Suspense>
    </>
  );
}
