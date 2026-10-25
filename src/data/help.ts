import type { IconName } from "@/components/ui/Icon";

/** Kartu "Panduan Cepat" di halaman Bantuan. */
export interface HelpGuide {
  title: string;
  description: string;
  icon: IconName;
  /** Halaman tujuan saat kartu diklik. */
  href: string;
  /** Kata kunci tambahan supaya pencarian lebih pintar. */
  keywords: string;
}

/**
 * Pertanyaan umum. Teks di dalam **tanda bintang ganda** ditampilkan tebal
 * (lihat RichText di components/admin/help/HelpFaq.tsx).
 */
export interface HelpFaqItem {
  question: string;
  answer: string;
  keywords: string;
}

export const HELP_GUIDES: HelpGuide[] = [
  {
    title: "Kelola Pesanan",
    description: "Lihat pesanan masuk, ubah status, dan buka detail pelanggan.",
    icon: "receipt-text",
    href: "/admin-dashboard/pesanan",
    keywords: "pesanan order status proses selesai batal pelanggan",
  },
  {
    title: "Atur Menu",
    description: "Tambah menu, ubah harga, stok, dan tampilkan menu ke website.",
    icon: "utensils",
    href: "/admin-dashboard/menu",
    keywords: "menu makanan harga stok website andalan tambah edit",
  },
  {
    title: "Kelola Reservasi",
    description: "Konfirmasi reservasi, atur meja, dan pantau agenda hari ini.",
    icon: "calendar-check",
    href: "/admin-dashboard/reservasi",
    keywords: "reservasi meja pelanggan konfirmasi hadir selesai whatsapp",
  },
  {
    title: "Kelola Katering",
    description: "Pantau pesanan acara, jumlah pax, DP, hingga status produksi.",
    icon: "chef-hat",
    href: "/admin-dashboard/katering",
    keywords: "katering catering acara nasi kotak prasmanan dp produksi",
  },
];

export const HELP_FAQ: HelpFaqItem[] = [
  {
    question: "Bagaimana mengubah status pesanan?",
    answer:
      "Buka menu **Pesanan**, pilih baris pesanan, lalu gunakan tombol proses berikutnya. Status bergerak dari Baru → Diproses → Siap → Selesai.",
    keywords: "pesanan status baru diproses siap selesai",
  },
  {
    question: "Bagaimana menyembunyikan menu dari website?",
    answer:
      "Masuk ke **Menu Makanan**, kemudian nonaktifkan toggle **Website** pada menu yang tidak ingin ditampilkan.",
    keywords: "menu website tampil nonaktif stok",
  },
  {
    question: "Apa alur status reservasi?",
    answer:
      "Reservasi berjalan dari Menunggu → Dikonfirmasi → Hadir → Selesai. Reservasi juga dapat dibatalkan melalui halaman detail.",
    keywords: "reservasi konfirmasi hadir pelanggan meja",
  },
  {
    question: "Bagaimana mengunduh laporan?",
    answer:
      "Pada halaman **Laporan**, pilih periode dan kanal terlebih dahulu. Gunakan tombol Excel untuk ekspor data atau PDF/Cetak untuk membuka dialog cetak browser.",
    keywords: "laporan excel pdf cetak filter tanggal kanal",
  },
  {
    question: "Bagaimana menampilkan promo di website?",
    answer:
      "Buka **Promo**, aktifkan promo dan toggle **Website**. Pastikan periode promo masih berlaku agar statusnya menjadi Aktif.",
    keywords: "promo website aktif tanggal diskon",
  },
];

/** Pilihan kategori di form "Masih Butuh Bantuan?". */
export const HELP_CATEGORIES = [
  "Pesanan",
  "Menu Makanan",
  "Reservasi",
  "Katering",
  "Laporan",
  "Promo",
  "Lainnya",
];

export const HELP_MESSAGE_MAX = 400;
