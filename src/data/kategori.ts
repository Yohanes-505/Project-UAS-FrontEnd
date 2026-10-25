import type { Kategori } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const KATEGORI_DEFAULT: Kategori[] = [
  { id:'KAT-001', name:'Rendang',        image:'images/menu/rendang.jpg',       desc:'Daging sapi dimasak perlahan dengan santan dan rempah sampai bumbunya kering dan meresap.', taste:'Gurih, Rempah kuat', spicy:1, menuId:'MN-001', menuName:'Rendang Daging', visible:true },
  { id:'KAT-002', name:'Dendeng Balado', image:'images/menu/dendengbalado.jpg', desc:'Irisan daging sapi tipis digoreng kering lalu dibalut sambal cabai merah.',                taste:'Pedas, Renyah',      spicy:2, menuId:'',       menuName:'',               visible:true },
  { id:'KAT-003', name:'Gulai Tunjang',  image:'images/menu/gulaitunjang.jpg',  desc:'Kikil sapi kenyal dalam kuah gulai kuning kental yang kaya rempah.',                        taste:'Gurih, Berkuah',     spicy:1, menuId:'MN-004', menuName:'Gulai Tunjang',  visible:true },
  { id:'KAT-004', name:'Gulai Ikan',     image:'images/menu/gulaiikan.jpg',     desc:'Ikan segar dimasak dalam kuah santan kuning dengan sedikit asam kandis.',                   taste:'Gurih, Sedikit asam', spicy:1, menuId:'MN-005', menuName:'Gulai Ikan',     visible:true },
  { id:'KAT-005', name:'Telur Balado',   image:'images/menu/telurbalado.jpg',   desc:'Telur rebus digoreng sebentar lalu disiram sambal balado merah.',                           taste:'Pedas manis',        spicy:2, menuId:'MN-006', menuName:'Telur Balado',   visible:true },
  { id:'KAT-006', name:'Perkedel',       image:'images/menu/perkedel.jpg',      desc:'Kentang tumbuk berbumbu, dicelup telur, lalu digoreng sampai keemasan.',                    taste:'Gurih, Lembut',      spicy:0, menuId:'MN-007', menuName:'Perkedel',       visible:true },
  { id:'KAT-007', name:'Ayam Bakar',     image:'images/menu/ayambakar.jpg',     desc:'Ayam berbumbu kuning dibakar di atas arang sampai harum.',                                  taste:'Gurih, Smoky',       spicy:1, menuId:'MN-008', menuName:'Ayam Bakar',     visible:true }
];

export const SPICY_LABEL: string[] = ['Tidak pedas', 'Sedikit pedas', 'Pedas', 'Sangat pedas'];
