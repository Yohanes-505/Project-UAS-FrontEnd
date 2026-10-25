import type { Settings } from "@/types";

// Disalin apa adanya dari admin-dashboard/script.js (data awal / seed).
export const SETTINGS_DEFAULT: Settings = {
  adminName:'Admin Utama', adminRole:'Super Admin', adminEmail:'',
  storeName:'Lamak Bana', storePhone:'', storeCity:'Jakarta', storeAddress:'',
  weekdayOpen:'09:00', weekdayClose:'22:00', weekendOpen:'08:00', weekendClose:'23:00',
  notifOrder:true, notifReservation:true, notifCatering:true, notifStock:true
};
