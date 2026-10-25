import type { MenuItem } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const MENU_DATA_DEFAULT: MenuItem[] = [
  { id:'MN-001', name:'Rendang Daging', category:'Daging', price:28000, stock:12, available:true, website:true, featured:true, tone:'rendang', desc:'Daging sapi dimasak 8 jam dengan santan dan rempah Minang.' },
  { id:'MN-002', name:'Ayam Pop', category:'Ayam', price:25000, stock:18, available:true, website:true, featured:true, tone:'ayam', desc:'Ayam kampung direbus bumbu lalu digoreng sebentar, lembut dan gurih.' },
  { id:'MN-003', name:'Dendeng Batokok', category:'Daging', price:30000, stock:9, available:true, website:true, featured:true, tone:'dendeng', desc:'Daging tipis dipukul, dibakar, lalu disiram sambal lado mudo.' },
  { id:'MN-004', name:'Gulai Tunjang', category:'Gulai', price:27000, stock:6, available:true, website:true, featured:false, tone:'gulai', desc:'Tunjang sapi empuk dengan kuah gulai Minang yang kaya rempah.' },
  { id:'MN-005', name:'Gulai Ikan', category:'Gulai', price:29000, stock:14, available:true, website:true, featured:false, tone:'ikan', desc:'Ikan dengan kuah gulai santan dan rempah segar khas Minang.' },
  { id:'MN-006', name:'Telur Balado', category:'Telur', price:15000, stock:20, available:true, website:true, featured:false, tone:'telur', desc:'Telur dengan balado merah pedas gurih khas rumah makan Minang.' },
  { id:'MN-007', name:'Perkedel', category:'Pendamping', price:10000, stock:7, available:true, website:true, featured:false, tone:'perkedel', desc:'Perkedel kentang lembut dengan bumbu sederhana dan gurih.' },
  { id:'MN-008', name:'Ayam Bakar', category:'Ayam', price:32000, stock:0, available:false, website:true, featured:false, tone:'bakar', desc:'Ayam bakar berbumbu Minang dengan aroma panggang yang kuat.' }
];

/** Foto bawaan menurut nama menu (path relatif ke folder public/). */
export const MENU_PHOTO_BY_NAME: Record<string, string> = {
  'rendang daging':  'images/menu/rendang.jpg',
  'ayam pop':        'images/hero/ayampop.jpg',
  'dendeng batokok': 'images/menu/dendengbalado.jpg',
  'gulai tunjang':   'images/menu/gulaitunjang.jpg',
  'gulai ikan':      'images/menu/gulaiikan.jpg',
  'telur balado':    'images/menu/telurbalado.jpg',
  'perkedel':        'images/menu/perkedel.jpg',
  'ayam bakar':      'images/menu/ayambakar.jpg'
};

/** Path foto sebuah menu: pakai `image` kalau sudah diatur admin, kalau belum cari dari nama. */
export function menuImage(menu?: Pick<MenuItem, "name" | "image"> | null): string {
  if (!menu) return "";
  if (typeof menu.image === "string") return menu.image; // "" = sengaja tanpa foto
  return MENU_PHOTO_BY_NAME[String(menu.name || "").toLowerCase().trim()] || "";
}
