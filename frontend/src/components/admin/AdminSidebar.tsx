"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Star,
  Ticket,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuth";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";
import LanguageToggle from "@/components/layout/LanguageToggle";

export default function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAdminAuthStore((s) => s.logout);
  const t = useT();

  const links = [
    { href: "/admin", label: t("admin.nav.dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: t("admin.nav.products"), icon: Package },
    { href: "/admin/categories", label: t("admin.nav.categories"), icon: FolderTree },
    { href: "/admin/orders", label: t("admin.nav.orders"), icon: ShoppingCart },
    { href: "/admin/reviews", label: t("admin.nav.reviews"), icon: Star },
    { href: "/admin/coupons", label: t("admin.nav.coupons"), icon: Ticket },
  ];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-e border-charcoal/10 bg-ivory">
      <div className="px-6 py-6">
        <span className="font-display text-xl tracking-[0.1em] text-charcoal">AYLA MUSK</span>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">{t("admin.consoleTitle")}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                active ? "bg-deep-rose text-ivory" : "text-charcoal/65 hover:bg-blush-soft"
              )}
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-charcoal/10 px-3 py-4">
        <div className="px-1.5 pb-2">
          <LanguageToggle />
        </div>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-charcoal/60 hover:bg-blush-soft">
          <ExternalLink size={16} /> {t("admin.nav.viewStore")}
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-start text-sm text-charcoal/60 hover:bg-blush-soft cursor-pointer">
          <LogOut size={16} /> {t("admin.nav.signOut")}
        </button>
      </div>
    </aside>
  );
}
