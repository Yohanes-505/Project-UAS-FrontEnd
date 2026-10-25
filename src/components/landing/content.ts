/**
 * Teks dan konstanta statis landing page.
 * Ubah di sini kalau ada yang perlu disesuaikan, tidak perlu cari di komponen.
 */

/** Dipakai kalau Pengaturan admin (nomor / alamat) belum diisi. TODO: ganti dengan data asli restoran. */
export const FALLBACK_CONTACT = {
  phone: "0812-0000-0000",
  email: "halo@lamakbana.id",
  address: "Jakarta Barat",
};

/** TODO: ganti dengan akun resmi. */
export const SOCIALS = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
] as const;

export const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu", label: "Menu" },
  { id: "promo", label: "Promo" },
  { id: "tentang", label: "Tentang" },
  { id: "katering", label: "Katering" },
  { id: "reservasi", label: "Reservasi" },
] as const;

export const BROSUR_URL = "/files/brosur-katering-lamak-bana.pdf";

/** Foto yang berganti pelan di tiga lingkaran hero (path relatif ke public/). */
export const HERO_PHOTOS = {
  left: ["images/hero/rendang.jpg", "images/menu/gulaiikan.jpg", "images/menu/dendengbalado.jpg"],
  center: ["images/hero/nasipadang.jpg", "images/menu/rendang.jpg", "images/menu/gulaitunjang.jpg"],
  right: ["images/hero/ayampop.jpg", "images/menu/telurbalado.jpg", "images/menu/ayambakar.jpg"],
};

export const RESERVASI_PHOTOS = [
  "images/reservasi/rendang.jpeg",
  "images/hero/nasipadang.jpg",
  "images/menu/ayambakar.jpg",
];

export const KATERING_CARDS = [
  { src: "images/katering/nasikotak.jpeg", label: "Nasi Kotak", wide: true },
  { src: "images/katering/prasmanan.jpeg", label: "Prasmanan", wide: false },
  { src: "images/katering/arisan.jpeg", label: "Arisan & Syukuran", wide: false },
];

export const KENAPA_ITEMS = [
  { num: "01", title: "Resep Turun-Temurun", text: "Bumbu dan cara memasak dijaga sama seperti sejak dapur pertama kami dibuka tahun 1998." },
  { num: "02", title: "Rempah Pilihan", text: "Santan, cabai, dan rempah diracik untuk rasa Minang yang pekat, bukan sekadar pedas." },
  { num: "03", title: "Dimasak Perlahan", text: "Rendang dimasak berjam-jam sampai bumbunya meresap dan dagingnya empuk." },
  { num: "04", title: "Untuk Meja dan Acara", text: "Makan di tempat, bawa pulang, sampai katering ratusan porsi untuk acara kantor dan keluarga." },
];

/** Harga estimasi katering per box / porsi. Samakan dengan harga yang dipakai admin. */
export const CATERING_RULES = {
  "Nasi Kotak": {
    price: 35000,
    unit: "box",
    minPax: 20,
    packages: ["Nasi Kotak Rendang", "Nasi Kotak Ayam Pop + Rendang", "Nasi Kotak Dendeng"],
    desc: "Praktis untuk rapat, seminar, dan acara kantor.",
  },
  Prasmanan: {
    price: 90000,
    unit: "porsi",
    minPax: 30,
    packages: ["Paket Prasmanan Keluarga", "Paket Prasmanan Minang A", "Paket Pernikahan Minang"],
    desc: "Hidangan disajikan buffet lengkap dengan perlengkapan.",
  },
} as const;
export type CateringService = keyof typeof CATERING_RULES;

export const CATERING_EVENTS = ["Acara Kantor", "Pernikahan", "Arisan & Syukuran", "Lainnya"];
export const RESERVATION_AREAS = ["Ruang Utama", "Area Jendela", "Area Keluarga", "Private Room"];
export const ORDER_CHANNELS = ["Makan di Tempat", "Ambil Sendiri", "Ojek Online"] as const;
export const ORDER_CHANNEL_INFO: Record<(typeof ORDER_CHANNELS)[number], string> = {
  "Makan di Tempat": "Meja diatur kasir",
  "Ambil Sendiri": "Ambil di kasir",
  "Ojek Online": "Dipesan lewat website",
};