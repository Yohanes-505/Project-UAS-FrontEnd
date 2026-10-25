import { isoShift } from "@/lib/format";
import { byDateTime, DEMO_TODAY, idNumber, textMatches } from "@/lib/booking";
import type { Reservation, ReservationStatus, Settings } from "@/types";
import type { IconName } from "@/components/ui/Icon";

export const RESERVATION_TABS: Array<"Semua" | ReservationStatus> = [
  "Semua",
  "Menunggu",
  "Dikonfirmasi",
  "Hadir",
  "Selesai",
  "Dibatalkan",
];

export const RESERVATION_STATUS_OPTIONS: ReservationStatus[] = [
  "Menunggu",
  "Dikonfirmasi",
  "Hadir",
  "Selesai",
  "Dibatalkan",
];

export const RESERVATION_AREAS = ["Ruang Utama", "Area Jendela", "Area Keluarga", "Private Room"];

/** Jumlah meja restoran (untuk kartu "Meja Terisi"). */
export const TOTAL_TABLES = 18;

/** Status berikutnya saat tombol utama di drawer ditekan. */
export const RESERVATION_NEXT: Partial<Record<ReservationStatus, ReservationStatus>> = {
  Menunggu: "Dikonfirmasi",
  Dikonfirmasi: "Hadir",
  Hadir: "Selesai",
};

export const SOURCE_ICON: Record<string, IconName> = {
  Website: "globe-2",
  WhatsApp: "message-circle",
  Telepon: "phone",
  Admin: "user-round-cog",
};

export interface ReservationFilters {
  search: string;
  status: "Semua" | ReservationStatus;
  source: string;
  date: string;
}

export const RESERVATION_FILTERS_DEFAULT: ReservationFilters = {
  search: "",
  status: "Semua",
  source: "Semua",
  date: "Hari ini",
};

function matchesDate(r: Reservation, filter: string): boolean {
  if (filter === "Hari ini") return r.date === DEMO_TODAY;
  if (filter === "Besok") return r.date === isoShift(DEMO_TODAY, 1);
  if (filter === "7 hari") return r.date >= DEMO_TODAY && r.date <= isoShift(DEMO_TODAY, 6);
  return true; // "Semua Tanggal"
}

/** Semua filter KECUALI status; dipakai untuk menghitung angka di tiap tab. */
export function reservationsBase(list: Reservation[], f: ReservationFilters): Reservation[] {
  return list.filter(
    (r) =>
      (f.source === "Semua" || r.source === f.source) &&
      matchesDate(r, f.date) &&
      textMatches(f.search, r.id, r.customer, r.phone, r.table, r.area, r.source, r.occasion),
  );
}

export function filterReservations(list: Reservation[], f: ReservationFilters): Reservation[] {
  return reservationsBase(list, f)
    .filter((r) => f.status === "Semua" || r.status === f.status)
    .sort(byDateTime);
}

/** Reservasi hari ini yang belum dibatalkan. */
export function todaysReservations(list: Reservation[]): Reservation[] {
  return list.filter((r) => r.date === DEMO_TODAY && r.status !== "Dibatalkan");
}

export function reservationStats(list: Reservation[]) {
  const today = todaysReservations(list);
  return {
    today: today.length,
    pending: today.filter((r) => r.status === "Menunggu").length,
    guests: today.reduce((sum, r) => sum + Number(r.pax || 0), 0),
    tables: new Set(today.filter((r) => r.table).map((r) => r.table)).size,
  };
}

/** Waktu harus ada di antara jam buka dan tutup (beda untuk hari kerja & akhir pekan). */
export function reservationHoursValid(dateIso: string, time: string, settings: Settings): boolean {
  const [y, m, d] = dateIso.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const weekend = day === 0 || day === 6;
  const open = weekend ? settings.weekendOpen : settings.weekdayOpen;
  const close = weekend ? settings.weekendClose : settings.weekdayClose;
  return time >= open && time <= close;
}

/** ID berikutnya, mis. "#RS-2609-032". */
export function nextReservationId(list: Reservation[]): string {
  const max = list.reduce((n, r) => Math.max(n, idNumber(r.id)), 0);
  return "#RS-2609-" + String(max + 1).padStart(3, "0");
}
