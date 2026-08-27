import type { Metadata } from "next";
import AdminLoginGate from "./AdminLoginGate";
import AdminShell from "./AdminShell";

export const metadata: Metadata = { title: "لوحة الإدارة" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLoginGate>
      <AdminShell>{children}</AdminShell>
    </AdminLoginGate>
  );
}
