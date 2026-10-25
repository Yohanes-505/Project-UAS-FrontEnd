import type { Promo } from "@/types";

export const PROMO_TYPES = ["Diskon Persen", "Gratis Ongkir", "Harga Spesial"];

export type PromoStatus = "Aktif" | "Terjadwal" | "Nonaktif";
export const PROMO_FILTERS: Array<"Semua" | PromoStatus> = ["Semua", "Aktif", "Terjadwal", "Nonaktif"];

/**
 * Status dihitung dari tanggal, bukan disimpan:
 * dimatikan admin atau sudah lewat -> Nonaktif, belum mulai -> Terjadwal, selain itu Aktif.
 * `today` berformat ISO "2026-10-25".
 */
export function promoStatus(promo: Pick<Promo, "active" | "start" | "end">, today: string): PromoStatus {
  if (!promo.active) return "Nonaktif";
  if (promo.start > today) return "Terjadwal";
  if (promo.end < today) return "Nonaktif";
  return "Aktif";
}

/** "2026-10-08" -> "8 Okt 2026" */
export function promoDate(iso: string): string {
  const parts = String(iso || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso || "—";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Foto bawaan untuk promo awal yang belum punya field `image`. */
const PROMO_PHOTO_BY_NAME: Record<string, string> = {
  "paket hemat nasi rendang": "images/hero/rendang.jpg",
  "hidang keluarga": "images/hero/nasipadang.jpg",
  "gratis ongkir": "images/menu/ayambakar.jpg",
};

/** Path foto promo: pakai `image` kalau sudah diatur admin ("" = tanpa foto), kalau belum cari dari nama. */
export function promoImage(promo?: Pick<Promo, "name" | "image"> | null): string {
  if (!promo) return "";
  if (typeof promo.image === "string") return promo.image;
  return PROMO_PHOTO_BY_NAME[String(promo.name || "").toLowerCase().trim()] ?? "";
}

/** ID promo berikutnya, mis. "PR-005". */
export function nextPromoId(promos: Promo[]): string {
  const max = promos.reduce((n, p) => Math.max(n, Number(p.id.replace(/\D/g, "")) || 0), 0);
  return "PR-" + String(max + 1).padStart(3, "0");
}
