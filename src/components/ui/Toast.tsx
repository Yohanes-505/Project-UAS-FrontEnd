"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

/**
 * Notifikasi kecil di kanan bawah (pengganti showToast di file asli).
 * Provider sudah dipasang di layout admin, jadi di halaman mana pun cukup:
 *
 *   const showToast = useToast();
 *   showToast("Menu berhasil disimpan.");
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const showToast = useCallback<ShowToast>((message) => {
    clearTimers();
    setLeaving(false);
    setToast({ id: Date.now(), message });
    timers.current.push(
      window.setTimeout(() => setLeaving(true), 2400),
      window.setTimeout(() => setToast(null), 2400 + 180),
    );
  }, []);

  useEffect(() => clearTimers, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="demo-toast"
          role="status"
          aria-live="polite"
          style={{ transition: "opacity 180ms ease", opacity: leaving ? 0 : 1 }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  return context;
}
