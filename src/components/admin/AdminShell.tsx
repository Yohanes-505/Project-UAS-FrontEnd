"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import {
  CATERING_DATA_DEFAULT,
  MENU_DATA_DEFAULT,
  ORDER_DATA_DEFAULT,
  PROMO_DATA_DEFAULT,
  RESERVATION_DATA_DEFAULT,
} from "@/data";
import { LOGIN_PATH, logout } from "@/lib/auth";
import { seedStorage, STORAGE_KEYS } from "@/lib/storage";
import { AuthGuard } from "./AuthGuard";
import { Header } from "./Header";
import { LogoutConfirm } from "./LogoutConfirm";
import { NotificationPanel } from "./NotificationPanel";
import { Sidebar } from "./Sidebar";

/**
 * Kerangka semua halaman admin: sidebar kiri, header atas, panel notifikasi,
 * konfirmasi keluar, dan toast. Isi halaman masuk lewat `children`.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Sama seperti versi HTML: simpan data awal saat admin pertama kali dibuka,
  // supaya landing page langsung membaca data yang sama.
  useEffect(() => {
    seedStorage(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);
    seedStorage(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
    seedStorage(STORAGE_KEYS.reservations, RESERVATION_DATA_DEFAULT);
    seedStorage(STORAGE_KEYS.catering, CATERING_DATA_DEFAULT);
    seedStorage(STORAGE_KEYS.promo, PROMO_DATA_DEFAULT);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace(LOGIN_PATH);
  };

  return (
    <AuthGuard>
      <ToastProvider>
        <div className="position-relative d-flex u-min-h-screen w-100 align-items-start">
          <Sidebar onLogout={() => setLogoutOpen(true)} />

          <div className="position-relative d-flex u-min-w-0 u-flex-1 flex-column align-items-start">
            <Header onOpenNotifications={() => setNotifOpen(true)} />
            {children}
          </div>

          <LogoutConfirm
            open={logoutOpen}
            onCancel={() => setLogoutOpen(false)}
            onConfirm={handleLogout}
          />
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
