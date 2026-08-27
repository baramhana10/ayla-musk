"use client";

import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  lastAddedName: string | null;
  flashAdded: (name: string) => void;
  /** Flips true once the intro sequence has handed off to the hero (either
   *  after playing, or immediately for skip/reduced-motion cases) so the
   *  hero's entrance can be choreographed to begin exactly on handoff
   *  instead of playing out, unseen, underneath the loader. */
  introComplete: boolean;
  setIntroComplete: (done: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  lastAddedName: null,
  flashAdded: (name) => set({ lastAddedName: name, cartOpen: true }),
  introComplete: false,
  setIntroComplete: (done) => set({ introComplete: done }),
}));
