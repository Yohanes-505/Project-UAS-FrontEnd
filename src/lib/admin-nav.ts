import type { IconName } from "@/components/ui/Icon";

export interface AdminNavItem {
  /** Teks di sidebar. Judul header = label ini dalam huruf kapital. */
  label: string;
  icon: IconName;
  href: string;
}

export const NAV_UTAMA: AdminNavItem[] = [
  { label: "Dashboard", icon: "layout-dashboard", href: "/admin-dashboard" },
  { label: "Pesanan", icon: "receipt", href: "/admin-dashboard/pesanan" },
  { label: "Menu Makanan", icon: "utensils", href: "/admin-dashboard/menu" },
  { label: "Reservasi", icon: "calendar-days", href: "/admin-dashboard/reservasi" },
  { label: "Katering", icon: "store", href: "/admin-dashboard/katering" },
  { label: "Laporan", icon: "bar-chart-3", href: "/admin-dashboard/laporan" },
];

export const NAV_LAINNYA: AdminNavItem[] = [
  { label: "Promo", icon: "tag", href: "/admin-dashboard/promo" },
  { label: "Bantuan", icon: "help-circle", href: "/admin-dashboard/bantuan" },
  { label: "Pengaturan", icon: "settings", href: "/admin-dashboard/pengaturan" },
];

export const ALL_ADMIN_NAV = [...NAV_UTAMA, ...NAV_LAINNYA];

/** Cari item nav yang cocok dengan URL sekarang. */
export function findAdminNav(pathname: string): AdminNavItem | undefined {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return ALL_ADMIN_NAV.find((item) => item.href === clean);
}

/**
 * Query string untuk tombol "Pesanan Baru / Reservasi Baru / Katering Baru".
 * Halaman tujuan membaca `?aksi=baru` lalu langsung membuka form tambah.
 */
export const QUICK_ACTION_PARAM = "aksi";
export const QUICK_ACTION_NEW = "baru";
