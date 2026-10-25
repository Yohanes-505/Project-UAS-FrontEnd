// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const DROPDOWN_OPTIONS: Record<string, string[]> = {
  status: ['Semua','Selesai','Diproses','Dibatalkan'],
  waktu:  ['Hari ini','7 hari terakhir','Bulan ini','Tahun ini'],
  tahun:  ['2026','2025','2024','2023'],
  'order-channel': ['Semua','Makan di Tempat','Ambil Sendiri','Ojek Online','Katering'],
  'order-date': ['Hari ini','7 hari','Bulan ini'],
  'menu-category': ['Semua','Daging','Ayam','Gulai','Telur','Pendamping'],
  'reservation-source': ['Semua','Website','WhatsApp','Telepon','Admin'],
  'reservation-date': ['Hari ini','Besok','7 hari','Semua Tanggal'],
  'catering-service': ['Semua','Nasi Kotak','Prasmanan'],
  'catering-date': ['Hari ini','7 hari','Bulan ini','Semua Tanggal'],
  'report-period': ['7 hari terakhir','Bulan ini','Tahun ini','Rentang tanggal'],
  'report-channel': ['Semua','Makan di Tempat','Ambil Sendiri','Ojek Online','Katering'],
};

/** Teks yang tampil di tombol filter untuk nilai tertentu (mis. "Semua" -> "Semua Kanal"). */
export function dropdownLabel(key: string, value: string): string {
  if (key === "order-channel" && value === "Semua") return "Semua Kanal";
  if (key === "order-date" && value === "7 hari") return "7 hari terakhir";
  if (key === "menu-category" && value === "Semua") return "Semua Kategori";
  if (key === "reservation-source" && value === "Semua") return "Semua Sumber";
  if (key === "reservation-date" && value === "7 hari") return "7 hari ke depan";
  if (key === "catering-service" && value === "Semua") return "Semua Layanan";
  if (key === "catering-date" && value === "7 hari") return "7 hari ke depan";
  if (key === "report-channel" && value === "Semua") return "Semua Kanal";
  return value;
}
