export interface AttentionItem {
  title: string;
  hint: string;
  href: string;
}
export const ATTENTION_WARNINGS: AttentionItem[] = [
  { title: "Rendang tinggal 12 porsi", hint: "Stok perlu diperiksa", href: "/admin-dashboard/menu" },
  { title: "Reservasi 13.00 pending", hint: "Nadia · 8 pax · Meja 12", href: "/admin-dashboard/reservasi" },
];

export interface AgendaItem {
  time: string;
  name: string;
  detail: string;
  href: string;
}
export const AGENDA_NEXT: AgendaItem[] = [
  { time: "13:00", name: "Nadia", detail: "Reservasi · 8 pax", href: "/admin-dashboard/reservasi" },
  { time: "16:30", name: "PT Sinar Jaya", detail: "Katering · 40 pax", href: "/admin-dashboard/katering" },
  { time: "Besok", name: "CV Minang Makmur", detail: "10:00 · 65 pax", href: "/admin-dashboard/katering" },
];

export const FINANCE_SUMMARY = {
  revenue: "Rp89,4 jt",
  targetLabel: "89% dari target Rp100 jt",
  targetPercent: 89,
  channels: [
    { name: "Makan di Tempat", amount: "Rp48,2 jt", share: "54%" },
    { name: "Ojek Online", amount: "Rp26,7 jt", share: "30%" },
    { name: "Katering", amount: "Rp14,5 jt", share: "16%" },
  ],
  performance: [
    { label: "Selesai", value: "92%", danger: false },
    { label: "Tepat waktu", value: "85%", danger: false },
    { label: "Dibatalkan", value: "4%", danger: true },
  ],
};

export const ORDER_TREND_SUMMARY = {
  total: "1.248",
  label: "pesanan bulan ini",
  growth: "+12% vs bulan lalu",
};

/* ---------- Grafik Tren Pesanan ---------- */
export const TREND_MAX = 3000;
// 30 titik harian: seri utama & seri pembanding.
export const TREND_MAIN = [1000,1250,1180,1600,1720,1420,1620,1980,1880,2100,1600,1720,1400,1900,1650,1720,1480,1880,1950,2280,2500,2000,2250,2000,2250,1900,2100,1950,2280,2500];
export const TREND_COMP = [500,560,480,620,560,700,820,760,950,760,640,720,500,700,620,900,720,840,700,980,1200,1150,1300,1250,1350,1150,1300,1200,1450,1500];

const YEAR_FACTOR: Record<string, number> = { "2026": 1, "2025": 0.88, "2024": 0.76, "2023": 0.64 };

export function trendDataForYear(year: string): { main: number[]; comp: number[] } {
  const f = YEAR_FACTOR[year] ?? 1;
  const ph = Number(year) % 7;
  const clamp = (v: number) => Math.max(0, Math.min(TREND_MAX, Math.round(v)));
  return {
    main: TREND_MAIN.map((v, i) => clamp(v * f + Math.sin(i * 0.6 + ph) * 90)),
    comp: TREND_COMP.map((v, i) => clamp(v * f * 0.95 + Math.cos(i * 0.5 + ph) * 60)),
  };
}
