"use client";

import { create } from "zustand";
import type { OrderDto } from "@/lib/api";

interface LastOrderState {
  order: OrderDto | null;
  setOrder: (order: OrderDto) => void;
}

/**
 * Holds the just-placed order in memory so the confirmation page can render
 * instantly for guest checkouts (which have no user session to re-fetch
 * the order by id). Logged-in users can still revisit it later via
 * /account/orders, which hits the authenticated API directly.
 */
export const useLastOrderStore = create<LastOrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
}));
