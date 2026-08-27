"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  remove: (slug: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((s) => s !== slug)
            : [...state.slugs, slug],
        })),
      isSaved: (slug) => get().slugs.includes(slug),
      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((s) => s !== slug) })),
    }),
    { name: "ayla-wishlist" }
  )
);
