/** "Rp79.000" -> 79000 */
export function rupiahNumber(text: string | number): number {
  return Number(String(text).replace(/[^0-9]/g, "")) || 0;
}

/** 79000 -> "Rp79.000" */
export function rupiah(value: number | string): string {
  return "Rp" + Number(value || 0).toLocaleString("id-ID");
}

/** Tanggal hari ini dalam format ISO lokal "2026-10-25". */
export function todayISO(date = new Date()): string {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

/** Geser tanggal ISO sebanyak `days` hari. */
export function isoShift(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return todayISO(new Date(y, m - 1, d + days));
}

/** "Admin Utama" -> "AU" */
export function initials(name: string, fallback = "AU"): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p.charAt(0)).join("") || fallback).toUpperCase();
}

/**
 * Ubah path foto jadi URL yang bisa dipakai di <img> atau CSS.
 * Foto upload (data:) dan link http dipakai apa adanya; foto bawaan
 * ("images/menu/rendang.jpg") diambil dari folder public/.
 */
export function photoUrl(img?: string | null): string {
  if (!img) return "";
  if (/^(data:|https?:|\/)/.test(img)) return img;
  return "/" + img;
}

/** Gabungkan className, abaikan yang kosong/false. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
