import type { Promo } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const PROMO_DATA_DEFAULT: Promo[] = [
  { id:'PR-001', name:'Paket Hemat Nasi Rendang', type:'Diskon Persen', value:'20%', start:'2026-09-23', end:'2026-10-08', active:true, website:true, desc:'Hemat 20% untuk paket nasi rendang pilihan.' },
  { id:'PR-002', name:'Gratis Ongkir', type:'Gratis Ongkir', value:'Min. Rp100rb', start:'2026-09-20', end:'2026-10-08', active:true, website:true, desc:'Gratis ongkir untuk pengantaran area Jakarta dengan minimum transaksi Rp100.000.' },
  { id:'PR-003', name:'Hidang Keluarga', type:'Diskon Persen', value:'30%', start:'2026-10-01', end:'2026-10-12', active:true, website:true, desc:'Hemat 30% untuk paket hidangan keluarga selama periode promo.' },
  { id:'PR-004', name:'Promo Akhir Pekan', type:'Harga Spesial', value:'Rp99.000', start:'2026-09-12', end:'2026-09-20', active:false, website:false, desc:'Paket pilihan akhir pekan dengan harga spesial.' }
];
