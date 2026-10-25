"use client";

import { createContext, useContext } from "react";

export interface OrderOptions {
  menuId?: string;
  promoId?: string;
}

export interface LandingActions {
  openOrder: (options?: OrderOptions) => void;
  openCatering: () => void;
  openReservation: () => void;
  openKategori: (id: string) => void;
  /** id kategori yang sedang dibuka di pop up (untuk gaya .active), atau null */
  activeKategori: string | null;
}

const LandingContext = createContext<LandingActions | null>(null);

export const LandingProvider = LandingContext.Provider;

/** Aksi untuk membuka modal dari komponen mana pun di landing page. */
export function useLanding(): LandingActions {
  const value = useContext(LandingContext);
  if (!value) throw new Error("useLanding harus dipakai di dalam <LandingRoot>.");
  return value;
}