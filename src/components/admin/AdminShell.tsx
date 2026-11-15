"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { LOGIN_PATH, logout } from "@/lib/auth";
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

  // Semua data (menu, kategori, promo, pengaturan, pesanan, reservasi, katering) ada di database.

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
