import type { StatusStyle } from "@/types";

/**
 * Bagian yang dipakai bersama halaman Reservasi dan Katering.
 */

/**
 * "Hari ini" di halaman Reservasi & Katering. Data awal (seed) dibuat untuk
 * 28 September 2026, jadi tanggal ini dikunci supaya demo selalu terisi,
 * sama seperti versi HTML (RESERVATION_TODAY / CATERING_TODAY).
 */
export const DEMO_TODAY = "2026-09-28";

/** Pilihan "Sumber" di form dan filter. */
export const BOOKING_SOURCES = ["Website", "WhatsApp", "Telepon", "Admin"];

/** "2026-09-28" -> "28 Sep" (compact) atau "28 Sep 2026". */
export function formatBookingDate(iso: string, compact = false): string {
  const parts = String(iso || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat(
    "id-ID",
    compact ? { day: "2-digit", month: "short" } : { day: "numeric", month: "short", year: "numeric" },
  ).format(date);
}

/** "2026-09-28" -> "28 September 2026" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(y, m - 1, d),
  );
}

/** Urutkan berdasarkan tanggal lalu jam. */
export function byDateTime<T extends { date: string; time: string }>(a: T, b: T): number {
  return (a.date + a.time).localeCompare(b.date + b.time);
}

/** Angka terakhir dari ID, mis. "#RS-2609-031" -> 31. */
export function idNumber(id: string): number {
  return Number((id.match(/(\d+)$/) || [])[1]) || 0;
}

/** Cocokkan kata kunci pencarian (huruf besar/kecil diabaikan). */
export function textMatches(query: string, ...fields: Array<string | number>): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.join(" ").toLowerCase().includes(q);
}

/** Ambil gaya warna status, cadangannya status pertama. */
export function pickStatusStyle(styles: Record<string, StatusStyle>, status: string): StatusStyle {
  return styles[status] ?? styles.Menunggu;
}

/** "09:00" -> "09.00" */
export function dotTime(time: string): string {
  return time.replace(":", ".");
}
