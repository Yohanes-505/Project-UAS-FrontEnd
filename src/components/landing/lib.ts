import type { Settings } from "@/types";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const pad = (n: number) => String(n).padStart(2, "0");

/** "25 Okt 2026" (sama bentuknya dengan data awal admin) */
export function tanggalPendek(d = new Date()): string {
  return `${pad(d.getDate())} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "14:05" */
export function jamMenit(d = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "25 Okt 2026 · 14:05" */
export function stempelWaktu(d = new Date()): string {
  return `${tanggalPendek(d)} · ${jamMenit(d)}`;
}

/** ID berikutnya, mis. nextId(ids, "LB") -> "#LB-2610-001". Nomor urut dihitung per bulan. */
export function nextId(existing: string[], prefix: "LB" | "RS" | "KT", d = new Date()): string {
  const yymm = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1);
  const re = new RegExp(`^#${prefix}-${yymm}-(\\d+)$`);
  let max = 0;
  for (const id of existing) {
    const m = re.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `#${prefix}-${yymm}-${String(max + 1).padStart(3, "0")}`;
}

/** Nomor HP Indonesia: 08xx..., 628xx..., atau +628xx... */
export function isValidPhone(text: string): boolean {
  return /^(\+62|62|0)8\d{7,12}$/.test(text.replace(/[\s-]/g, ""));
}

/** "0812-8890-2214" -> "6281288902214" untuk link wa.me */
export function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

/** "09:00" -> "09.00" */
export const jamTitik = (hhmm: string) => hhmm.replace(":", ".");

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function hoursFor(weekend: boolean, s: Settings) {
  return weekend
    ? { open: s.weekendOpen, close: s.weekendClose }
    : { open: s.weekdayOpen, close: s.weekdayClose };
}

/** Sabtu dan Minggu dianggap akhir pekan. `day`: 0 = Minggu ... 6 = Sabtu */
export const isWeekendDay = (day: number) => day === 0 || day === 6;

export function isWeekendISO(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  return isWeekendDay(new Date(y, m - 1, d).getDay());
}

/** Hari dan jam sekarang di Waktu Indonesia Barat (WIB), apa pun zona waktu perangkat. */
export function wibNow(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day: Math.max(day, 0), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Jam reservasi valid: dalam jam buka, dan paling lambat 1 jam sebelum tutup. */
export function reservationTimeError(iso: string, time: string, s: Settings): string {
  const { open, close } = hoursFor(isWeekendISO(iso), s);
  const t = toMinutes(time);
  if (t < toMinutes(open) || t > toMinutes(close) - 60) {
    return `Pada tanggal itu kami buka ${jamTitik(open)}–${jamTitik(close)} WIB. Reservasi terakhir pukul ${jamTitik(
      `${pad(Math.floor((toMinutes(close) - 60) / 60))}:${pad((toMinutes(close) - 60) % 60)}`,
    )}.`;
  }
  return "";
}

/** Persen dari teks promo "20%" -> 20. Selain diskon persen hasilnya 0. */
export function promoPercent(type: string, value: string): number {
  if (type !== "Diskon Persen") return 0;
  const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(value);
  return m ? Math.min(100, Number(m[1].replace(",", "."))) : 0;
}