import type { StatusStyle } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const STATUS_STYLE: Record<string, StatusStyle> = {
  Baru:       { bg: 'rgba(139,30,30,.09)', color: '#8b1e1e' },
  Diproses:   { bg: 'rgba(242,169,59,.20)', color: '#7a5200' },
  Siap:       { bg: 'rgba(54,95,145,.10)', color: '#365f91' },
  Selesai:    { bg: 'rgba(47,93,58,.12)', color: '#2f5d3a' },
  Dibatalkan: { bg: 'rgba(180,35,24,.09)', color: '#b42318' },
};

export const RESERVATION_STATUS_STYLE: Record<string, StatusStyle> = {
  Menunggu:      { bg:'rgba(242,169,59,.20)', color:'#7a5200' },
  Dikonfirmasi:  { bg:'rgba(47,93,58,.12)', color:'#2f5d3a' },
  Hadir:         { bg:'rgba(38,95,135,.11)', color:'#265f87' },
  Selesai:       { bg:'rgba(59,31,20,.08)', color:'#3b1f14' },
  Dibatalkan:    { bg:'rgba(139,30,30,.10)', color:'#8b1e1e' },
};

export const CATERING_STATUS_STYLE: Record<string, StatusStyle> = {
  Menunggu:     { bg:'rgba(242,169,59,.20)', color:'#7a5200' },
  Penawaran:    { bg:'rgba(139,30,30,.09)', color:'#8b1e1e' },
  Dikonfirmasi: { bg:'rgba(47,93,58,.12)', color:'#2f5d3a' },
  Produksi:     { bg:'rgba(38,95,135,.11)', color:'#265f87' },
  Selesai:      { bg:'rgba(59,31,20,.08)', color:'#3b1f14' },
  Dibatalkan:   { bg:'rgba(139,30,30,.10)', color:'#8b1e1e' },
};
