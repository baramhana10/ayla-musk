"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useLocale } from "@/store/locale";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="flex min-h-screen bg-ivory-deep">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/40 lg:hidden"
            />
            <motion.div
              initial={{ x: isArabic ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isArabic ? "100%" : "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 start-0 z-50 lg:hidden"
            >
              <AdminSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-charcoal/10 bg-ivory px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen((o) => !o)} className="text-charcoal cursor-pointer">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-display text-lg">AYLA MUSK Admin</span>
        </div>
        <div className="flex-1 p-5 sm:p-8">{children}</div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}
