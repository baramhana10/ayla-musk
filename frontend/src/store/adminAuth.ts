"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, ApiClientError } from "@/lib/api";

export const DEMO_ADMIN_EMAIL = "admin@aylamusk.com";
export const DEMO_ADMIN_PASSWORD = "admin123";

interface AdminAuthState {
  isAdmin: boolean;
  adminEmail: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Admin console auth reuses the same backend session (httpOnly JWT cookie)
 * as the storefront — an account is authorized here only if its role is
 * ADMIN, verified server-side by the /api/auth/me + requireAdmin checks.
 */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminEmail: null,
      hydrated: false,
      login: async (email, password) => {
        try {
          const { user } = await authApi.login(email, password);
          if (user.role !== "ADMIN") {
            await authApi.logout().catch(() => {});
            return false;
          }
          set({ isAdmin: true, adminEmail: user.email, hydrated: true });
          return true;
        } catch {
          return false;
        }
      },
      logout: async () => {
        await authApi.logout().catch(() => {});
        set({ isAdmin: false, adminEmail: null });
      },
      refresh: async () => {
        try {
          const { user } = await authApi.me();
          set({ isAdmin: user.role === "ADMIN", adminEmail: user.role === "ADMIN" ? user.email : null, hydrated: true });
        } catch (err) {
          if (err instanceof ApiClientError && err.status === 401) set({ isAdmin: false, adminEmail: null, hydrated: true });
          else set({ hydrated: true });
        }
      },
    }),
    { name: "ayla-admin-auth", partialize: (state) => ({ isAdmin: state.isAdmin, adminEmail: state.adminEmail }) }
  )
);
