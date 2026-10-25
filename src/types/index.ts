/**
 * Tipe data bersama Lamak Bana.
 * Bentuknya mengikuti data asli di admin-dashboard/script.js supaya
 * data lama di localStorage tetap terbaca.
 */

/* ---------- Pesanan ---------- */
export type OrderStatus = "Baru" | "Diproses" | "Siap" | "Selesai" | "Dibatalkan";

/** [nama menu, jumlah, harga satuan dalam teks "Rp28.000"] */
export type OrderItem = [name: string, qty: number, price: string];

/** [jam "12:48", keterangan] */
export type OrderTimelineEntry = [time: string, label: string];

export interface Order {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  summary: string;
  channel: string;
  channelInfo: string;
  time: string;
  date: string;
  total: string;
  subtotal: string;
  discount: string;
  status: OrderStatus;
  payment: string;
  paymentStatus: string;
  note: string;
  timeline: OrderTimelineEntry[];
}

/* ---------- Menu ---------- */
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
  website: boolean;
  featured: boolean;
  tone: string;
  desc: string;
  /** Path foto ("images/menu/rendang.jpg"), data URL hasil upload, atau "" = tanpa foto. */
  image?: string;
}

/* ---------- Kategori (kartu kategori di landing) ---------- */
export interface Kategori {
  id: string;
  name: string;
  image: string;
  desc: string;
  taste: string;
  /** 0 = tidak pedas ... 3 = sangat pedas */
  spicy: number;
  menuId: string;
  menuName: string;
  visible: boolean;
}

/* ---------- Reservasi ---------- */
export type ReservationStatus = "Menunggu" | "Dikonfirmasi" | "Hadir" | "Selesai" | "Dibatalkan";

export interface Reservation {
  id: string;
  customer: string;
  phone: string;
  /** ISO "2026-09-28" */
  date: string;
  /** "13:00" */
  time: string;
  pax: number;
  table: string;
  area: string;
  source: string;
  status: ReservationStatus;
  occasion: string;
  note: string;
  createdAt: string;
}

/* ---------- Katering ---------- */
export type CateringStatus =
  | "Menunggu"
  | "Penawaran"
  | "Dikonfirmasi"
  | "Produksi"
  | "Selesai"
  | "Dibatalkan";

export interface Catering {
  id: string;
  customer: string;
  pic: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  event: string;
  service: string;
  package: string;
  address: string;
  total: number;
  dp: number;
  source: string;
  status: CateringStatus;
  note: string;
  createdAt: string;
}

/* ---------- Promo ---------- */
export interface Promo {
  id: string;
  name: string;
  type: string;
  value: string;
  start: string;
  end: string;
  active: boolean;
  website: boolean;
  desc: string;
  image?: string;
}

/* ---------- Pengaturan ---------- */
export interface Settings {
  adminName: string;
  adminRole: string;
  adminEmail: string;
  storeName: string;
  storePhone: string;
  storeCity: string;
  storeAddress: string;
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
  notifOrder: boolean;
  notifReservation: boolean;
  notifCatering: boolean;
  notifStock: boolean;
}

/* ---------- Lain-lain ---------- */
export interface AppNotification {
  title: string;
  detail: string;
  time: string;
  /** warna titik penanda */
  color: string;
}

export interface StatusStyle {
  bg: string;
  color: string;
}
