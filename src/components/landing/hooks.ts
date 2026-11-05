"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { useSettings } from "@/hooks/useSettings";
import { hoursFor, isWeekendDay, jamTitik, toMinutes, wibNow } from "./lib";

/**
 * Elemen ber-class `.reveal` muncul halus saat masuk layar dan reset saat keluar
 * (efek stagger di CSS memang mengandalkan class `show` bisa dicabut lagi).
 * Elemen baru, mis. kartu menu yang baru terbaca dari localStorage, ikut diamati otomatis.
 */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("show", e.isIntersecting)),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      root.querySelectorAll(".reveal").forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}

export interface BukaTutup {
  open: boolean;
  text: string;
}

/** Status buka/tutup berdasarkan jam di Pengaturan admin, dihitung dalam WIB. `null` sebelum terpasang di browser. */
export function useBukaTutup(): BukaTutup | null {
  const [settings] = useSettings();
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null);

  useEffect(() => {
    const tick = () => setNow(wibNow());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!now) return null;
    const today = hoursFor(isWeekendDay(now.day), settings);
    const isOpen = now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close);
    if (isOpen) return { open: true, text: `Buka sekarang · tutup ${jamTitik(today.close)} WIB` };
    if (now.minutes < toMinutes(today.open)) {
      return { open: false, text: `Tutup · buka hari ini ${jamTitik(today.open)} WIB` };
    }
    const besok = hoursFor(isWeekendDay((now.day + 1) % 7), settings);
    return { open: false, text: `Tutup · buka besok ${jamTitik(besok.open)} WIB` };
  }, [now, settings]);
}

/** Indeks yang naik tiap `ms` milidetik (untuk foto yang berganti). Berhenti kalau pengguna mematikan animasi. */
export function useRotatingIndex(length: number, ms: number, offset = 0): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setI((v) => (v + 1) % length), ms);
    }, offset);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [length, ms, offset]);
  return i;
}

/** Tutup modal dengan tombol Escape. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

/** Kunci scroll halaman selama ada modal terbuka (class `modal-open` sudah ada di CSS). */
export function useModalLock(locked: boolean) {
  useEffect(() => {
    document.body.classList.toggle("modal-open", locked);
    return () => document.body.classList.remove("modal-open");
  }, [locked]);
}