"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, LOGIN_PATH } from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/storage";

/**
 * Pelindung halaman admin. Kalau belum login, langsung dialihkan ke
 * /security-check dan isi dashboard tidak sempat tampil.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(LOGIN_PATH);
      return;
    }
    setAllowed(true);

    // Logout di tab lain -> tab ini ikut keluar.
    const onStorage = (event: StorageEvent) => {
      if ((event.key === STORAGE_KEYS.auth || event.key === null) && !isAuthenticated()) {
        router.replace(LOGIN_PATH);
      }
    };
    // Tombol Back setelah logout (halaman dari cache browser).
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !isAuthenticated()) window.location.replace(LOGIN_PATH);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  if (!allowed) return null;
  return <>{children}</>;
}
