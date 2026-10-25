import type { Order } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const ORDER_DATA_DEFAULT: Order[] = [
  {
    id:'#LB-2609-019', customer:'Siti Rahma', phone:'0812-8765-4321',
    items:[['Rendang Daging',2,'Rp28.000'],['Nasi Putih',2,'Rp8.000'],['Es Teh Manis',1,'Rp7.000']],
    summary:'Rendang Daging ×2, Nasi Putih ×2', channel:'Makan di Tempat', channelInfo:'Meja 08',
    time:'12:48', date:'28 Sep 2026', total:'Rp79.000', subtotal:'Rp79.000', discount:'Rp0',
    status:'Baru', payment:'QRIS', paymentStatus:'LUNAS', note:'Sambalnya dipisah.',
    timeline:[['12:48','Pesanan diterima']]
  },
  {
    id:'#LB-2609-018', customer:'Rina Maharani', phone:'0813-2201-8890',
    items:[['Rendang Daging',2,'Rp28.000'],['Nasi Putih',2,'Rp8.000'],['Teh Tawar',1,'Rp6.000']],
    summary:'Rendang Daging ×2, Nasi Putih', channel:'Makan di Tempat', channelInfo:'Meja 04',
    time:'12:40', date:'28 Sep 2026', total:'Rp78.000', subtotal:'Rp78.000', discount:'Rp0',
    status:'Selesai', payment:'Tunai', paymentStatus:'LUNAS', note:'Tidak ada catatan.',
    timeline:[['12:40','Pesanan diterima'],['12:42','Pesanan diproses'],['12:57','Pesanan siap'],['13:03','Pesanan selesai']]
  },
  {
    id:'#LB-2609-017', customer:'Budi Santoso', phone:'0819-7743-2291',
    items:[['Ayam Pop',1,'Rp29.000'],['Es Teh Manis',1,'Rp7.000'],['Nasi Putih',1,'Rp5.000']],
    summary:'Ayam Pop ×1, Es Teh Manis', channel:'Ojek Online', channelInfo:'GoFood · GF-98112',
    time:'12:32', date:'28 Sep 2026', total:'Rp41.000', subtotal:'Rp41.000', discount:'Rp0',
    status:'Diproses', payment:'GoPay', paymentStatus:'LUNAS', note:'Tambahkan sambal hijau.',
    timeline:[['12:32','Pesanan diterima'],['12:34','Pesanan diproses']]
  },
  {
    id:'#LB-2609-016', customer:'PT Sinar Jaya', phone:'021-5567-8811',
    items:[['Nasi Kotak Rendang',40,'Rp35.000']],
    summary:'Nasi Kotak Rendang ×40', channel:'Katering', channelInfo:'Kirim 16:30 · Slipi, Jakarta Barat',
    time:'11:15', date:'28 Sep 2026', total:'Rp1.400.000', subtotal:'Rp1.400.000', discount:'Rp0',
    status:'Diproses', payment:'Transfer Bank', paymentStatus:'DP 50%', note:'PIC: Ibu Nadia. Mohon sertakan sendok, tisu, dan label perusahaan.',
    timeline:[['11:15','Pesanan diterima'],['11:22','Pesanan dikonfirmasi'],['11:40','Pesanan diproses']]
  },
  {
    id:'#LB-2609-015', customer:'Dewi Lestari', phone:'0821-4432-1178',
    items:[['Dendeng Batokok',1,'Rp31.000'],['Nasi Putih',1,'Rp5.000']],
    summary:'Dendeng Batokok ×1', channel:'Ojek Online', channelInfo:'GrabFood · GF-77190',
    time:'11:02', date:'28 Sep 2026', total:'Rp36.000', subtotal:'Rp36.000', discount:'Rp0',
    status:'Dibatalkan', payment:'OVO', paymentStatus:'REFUND', note:'Dibatalkan pelanggan sebelum diproses.',
    timeline:[['11:02','Pesanan diterima'],['11:05','Pesanan dibatalkan']]
  },
  {
    id:'#LB-2609-014', customer:'Andi Pratama', phone:'0857-9001-2266',
    items:[['Gulai Tunjang',2,'Rp27.000'],['Nasi Putih',2,'Rp5.000']],
    summary:'Gulai Tunjang ×2, Nasi Putih', channel:'Makan di Tempat', channelInfo:'Meja 11',
    time:'10:48', date:'28 Sep 2026', total:'Rp64.000', subtotal:'Rp64.000', discount:'Rp0',
    status:'Selesai', payment:'QRIS', paymentStatus:'LUNAS', note:'Tidak ada catatan.',
    timeline:[['10:48','Pesanan diterima'],['10:50','Pesanan diproses'],['11:06','Pesanan siap'],['11:10','Pesanan selesai']]
  },
  {
    id:'#LB-2609-013', customer:'Maya Putri', phone:'0812-3309-8712',
    items:[['Sate Padang',2,'Rp30.000'],['Es Jeruk',2,'Rp8.000']],
    summary:'Sate Padang ×2, Es Jeruk ×2', channel:'Makan di Tempat', channelInfo:'Meja 02',
    time:'10:32', date:'28 Sep 2026', total:'Rp76.000', subtotal:'Rp76.000', discount:'Rp0',
    status:'Siap', payment:'QRIS', paymentStatus:'LUNAS', note:'Kuah sate dipisah satu.',
    timeline:[['10:32','Pesanan diterima'],['10:35','Pesanan diproses'],['10:51','Pesanan siap']]
  },
  {
    id:'#LB-2609-012', customer:'Fajar Ramadhan', phone:'0817-2255-6631',
    items:[['Ayam Bakar Padang',1,'Rp32.000'],['Nasi Putih',1,'Rp5.000'],['Es Teh',1,'Rp7.000']],
    summary:'Ayam Bakar Padang ×1, Nasi', channel:'Ojek Online', channelInfo:'ShopeeFood · SF-46118',
    time:'10:18', date:'28 Sep 2026', total:'Rp44.000', subtotal:'Rp44.000', discount:'Rp0',
    status:'Baru', payment:'ShopeePay', paymentStatus:'LUNAS', note:'Tidak pedas.',
    timeline:[['10:18','Pesanan diterima']]
  }
];
