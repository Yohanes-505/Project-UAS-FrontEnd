import { isoShift } from "@/lib/format";
import { byDateTime, DEMO_TODAY, idNumber, textMatches } from "@/lib/booking";
import type { Catering, CateringStatus } from "@/types";

export const CATERING_TABS: Array<"Semua" | CateringStatus> = [
  "Semua",
  "Menunggu",
  "Penawaran",
  "Dikonfirmasi",
  "Produksi",
  "Selesai",
  "Dibatalkan",
];

export const CATERING_STATUS_OPTIONS: CateringStatus[] = [
  "Menunggu",
  "Penawaran",
  "Dikonfirmasi",
  "Produksi",
  "Selesai",
  "Dibatalkan",
];

export const CATERING_EVENTS = ["Pernikahan", "Acara Kantor", "Arisan & Syukuran", "Lainnya"];
export const CATERING_SERVICES = ["Nasi Kotak", "Prasmanan"];

/** Status berikutnya + teks tombol utama di drawer. */
export const CATERING_NEXT: Partial<Record<CateringStatus, { status: CateringStatus; label: string }>> = {
  Menunggu: { status: "Penawaran", label: "Buat Penawaran" },
  Penawaran: { status: "Dikonfirmasi", label: "Konfirmasi Pesanan" },
  Dikonfirmasi: { status: "Produksi", label: "Mulai Produksi" },
  Produksi: { status: "Selesai", label: "Selesaikan" },
};

export interface CateringFilters {
  search: string;
  status: "Semua" | CateringStatus;
  service: string;
  date: string;
}

export const CATERING_FILTERS_DEFAULT: CateringFilters = {
  search: "",
  status: "Semua",
  service: "Semua",
  date: "7 hari",
};

/** 1400000 -> "Rp1.400.000"; compact: "Rp1,4 jt" / "Rp700 rb". */
export function cateringRupiah(value: number, compact = false): string {
  const n = Number(value || 0);
  if (compact && n >= 1_000_000) {
    return "Rp" + (n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  }
  if (compact && n >= 1_000) return "Rp" + Math.round(n / 1_000).toLocaleString("id-ID") + " rb";
  return "Rp" + n.toLocaleString("id-ID");
}

function matchesDate(c: Catering, filter: string): boolean {
  if (filter === "Hari ini") return c.date === DEMO_TODAY;
  if (filter === "7 hari") return c.date >= DEMO_TODAY && c.date <= isoShift(DEMO_TODAY, 6);
  if (filter === "Bulan ini") return c.date.slice(0, 7) === DEMO_TODAY.slice(0, 7);
  return true; // "Semua Tanggal"
}

/** Semua filter KECUALI status; dipakai untuk menghitung angka di tiap tab. */
export function cateringBase(list: Catering[], f: CateringFilters): Catering[] {
  return list.filter(
    (c) =>
      (f.service === "Semua" || c.service === f.service) &&
      matchesDate(c, f.date) &&
      textMatches(f.search, c.id, c.customer, c.pic, c.phone, c.event, c.service, c.package, c.address, c.source),
  );
}

export function filterCatering(list: Catering[], f: CateringFilters): Catering[] {
  return cateringBase(list, f)
    .filter((c) => f.status === "Semua" || c.status === f.status)
    .sort(byDateTime);
}

/** Pesanan yang masih berjalan (belum selesai / batal). */
export function activeCatering(list: Catering[]): Catering[] {
  return list.filter((c) => c.status !== "Dibatalkan" && c.status !== "Selesai");
}

/** Pesanan aktif yang tanggalnya hari ini atau sesudahnya, urut jadwal. */
export function upcomingCatering(list: Catering[]): Catering[] {
  return activeCatering(list)
    .filter((c) => c.date >= DEMO_TODAY)
    .sort(byDateTime);
}

export function cateringStats(list: Catering[]) {
  const upcoming = upcomingCatering(list);
  const week = upcoming.filter((c) => c.date <= isoShift(DEMO_TODAY, 6));
  return {
    upcoming: upcoming.length,
    pending: upcoming.filter((c) => c.status === "Menunggu" || c.status === "Penawaran").length,
    pax: week.reduce((sum, c) => sum + Number(c.pax || 0), 0),
    value: upcoming.reduce((sum, c) => sum + Number(c.total || 0), 0),
  };
}

/** Ringkasan layanan & pembayaran semua pesanan aktif. */
export function cateringOverview(list: Catering[]) {
  const active = activeCatering(list);
  const total = active.reduce((sum, c) => sum + Number(c.total || 0), 0);
  const dp = active.reduce((sum, c) => sum + Number(c.dp || 0), 0);
  return {
    box: active.filter((c) => c.service === "Nasi Kotak").length,
    buffet: active.filter((c) => c.service === "Prasmanan").length,
    dp,
    percent: total ? Math.min(100, Math.round((dp / total) * 100)) : 0,
  };
}

/** Sisa bayar dan persen DP satu pesanan. */
export function cateringPayment(c: Pick<Catering, "total" | "dp">) {
  const total = Number(c.total || 0);
  const dp = Number(c.dp || 0);
  return {
    balance: Math.max(0, total - dp),
    percent: total ? Math.min(100, Math.round((dp / total) * 100)) : 0,
  };
}

/** ID berikutnya, mis. "#KT-2609-015". */
export function nextCateringId(list: Catering[]): string {
  const max = list.reduce((n, c) => Math.max(n, idNumber(c.id)), 0);
  return "#KT-2609-" + String(max + 1).padStart(3, "0");
}
