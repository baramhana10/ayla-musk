"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { productsApi, ordersApi, adminApi, type OrderDto, type AdminStatsDto } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/ui/Badge";
import { useT } from "@/store/locale";

export default function AdminDashboardPage() {
  const t = useT();
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.stats(), ordersApi.list(), productsApi.list()])
      .then(([s, o, p]) => {
        setStats(s);
        setOrders(o.orders);
        setLowStock(p.products.filter((prod) => prod.variants.some((v) => v.stock > 0 && v.stock <= 10)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">{t("admin.dashboard.title")}</h1>
      <p className="mt-1 text-sm text-charcoal/50">{t("admin.dashboard.subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label={t("admin.dashboard.totalRevenue")} value={formatPrice(stats.revenue)} hint={`${stats.orderCount} ${t("admin.dashboard.orders")}`} />
        <StatCard icon={ShoppingCart} label={t("admin.dashboard.orders")} value={String(stats.orderCount)} hint={t("admin.dashboard.allTime")} />
        <StatCard icon={Package} label={t("admin.dashboard.avgOrderValue")} value={formatPrice(stats.avgOrderValue)} />
        <StatCard icon={AlertTriangle} label={t("admin.dashboard.lowStockItems")} value={String(stats.lowStockCount)} hint={t("admin.dashboard.lowStockHint")} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-charcoal">{t("admin.dashboard.recentOrders")}</h2>
            <Link href="/admin/orders" className="text-xs text-deep-rose hover:underline">{t("admin.dashboard.viewAll")}</Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-charcoal/45">{t("admin.dashboard.noOrders")}</p>
          ) : (
            <div className="mt-4 divide-y divide-charcoal/8">
              {orders.slice(0, 6).map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-3 text-sm hover:text-deep-rose">
                  <div>
                    <p className="font-medium text-charcoal">#{o.id}</p>
                    <p className="text-xs text-charcoal/45">{o.shippingAddress.fullName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{t(`admin.orders.status${o.status.charAt(0).toUpperCase()}${o.status.slice(1)}`)}</Badge>
                    <span className="text-charcoal/70">{formatPrice(o.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-charcoal/10 bg-ivory p-5">
          <h2 className="font-display text-lg text-charcoal">{t("admin.dashboard.lowStock")}</h2>
          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-charcoal/45">{t("admin.dashboard.wellStocked")}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {lowStock.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between text-sm hover:text-deep-rose">
                  <span className="text-charcoal">{p.name}</span>
                  <span className="text-wine">{Math.min(...p.variants.map((v) => v.stock))} {t("admin.dashboard.left")}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
