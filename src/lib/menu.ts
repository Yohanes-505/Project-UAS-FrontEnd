import type { Kategori, MenuItem } from "@/types";

/** Kategori makanan di editor menu; kategori Landing Page adalah entitas terpisah. */
export const MENU_CATEGORIES = ["Daging", "Ayam", "Gulai", "Telur", "Pendamping"];
export const MAX_FEATURED_MENU = 3;
export const LOW_STOCK_LIMIT = 7;

/** Kartu Menu Andalan pada Landing hanya memakai menu yang dipublikasikan. */
export function websiteFeaturedMenus(menu: MenuItem[]): MenuItem[] {
  return menu.filter((item) => item.website && item.featured).slice(0, MAX_FEATURED_MENU);
}

export function nextMenuId(items: MenuItem[]): string {
  const max = items.reduce((n, item) => Math.max(n, Number(item.id.replace(/\D/g, "")) || 0), 0);
  return `MN-${String(max + 1).padStart(3, "0")}`;
}

export function nextKategoriId(items: Kategori[]): string {
  const max = items.reduce((n, item) => Math.max(n, Number(item.id.replace(/\D/g, "")) || 0), 0);
  return `KAT-${String(max + 1).padStart(3, "0")}`;
}

export function menuStockLabel(menu: MenuItem): { label: string; className: string } {
  if (!menu.available || menu.stock <= 0) return { label: "Tidak tersedia", className: "is-out" };
  if (menu.stock <= LOW_STOCK_LIMIT) return { label: `Sisa ${menu.stock}`, className: "is-low" };
  return { label: `Stok ${menu.stock}`, className: "is-ok" };
}
