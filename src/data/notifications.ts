import type { AppNotification } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const NOTIFICATIONS: AppNotification[] = [
  { title: "Pesanan baru masuk", detail: "#LB-2609-019 · Siti Rahma · Rp79.000", time: "Baru saja", color: "#8b1e1e" },
  { title: "Pesanan katering dikonfirmasi", detail: "PT Sinar Jaya menyetujui penawaran", time: "8 mnt lalu", color: "#2f5d3a" },
  { title: "Stok Rendang Daging menipis", detail: "Sisa 12 porsi untuk hari ini", time: "26 mnt lalu", color: "#f2a93b" },
  { title: "Ulasan baru diterima", detail: "Rina Maharani memberi rating ★ 5", time: "1 jam lalu", color: "#3b1f14" },
];
