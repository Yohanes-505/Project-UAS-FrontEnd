"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_CHANGE_EVENT, apiGet, apiSend, errorMessage, notifyApiChange } from "@/lib/api";

/**
 * Daftar data dari backend (pengganti useLocalStorage untuk Menu, Kategori, Promo).
 *
 *   const { items, ready, error, create, update, patch, remove } = useApiList<MenuItem>("/api/menu");
 *
 * - Data diambil saat komponen tampil, saat tab difokuskan lagi, dan setiap ada
 *   perubahan lewat hook lain dengan path yang sama (create/update/patch/remove).
 * - `fallbackOnError`: dipakai HANYA kalau backend tidak bisa dihubungi dan belum pernah
 *   ada data sukses. Landing page mengisinya dengan data bawaan supaya tidak kosong.
 *   Halaman admin sengaja tidak mengisinya supaya kegagalan koneksi terlihat jelas.
 * - create/update/patch/remove mengembalikan Promise dan melempar ApiError kalau ditolak
 *   backend (mis. validasi), jadi panggil dengan try/catch lalu tampilkan toast.
 */
export function useApiList<T extends { id: string }>(path: string, fallbackOnError: T[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const ticket = ++latest.current; // abaikan respons lama yang datang terlambat
    try {
      const data = await apiGet<T[]>(path);
      if (ticket !== latest.current) return;
      hasData.current = true;
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      if (ticket !== latest.current) return;
      setError(errorMessage(err, "Gagal memuat data."));
    } finally {
      if (ticket === latest.current) setReady(true);
    }
  }, [path]);

  useEffect(() => {
    load();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ path: string }>).detail;
      if (detail?.path === path) load();
    };
    window.addEventListener(API_CHANGE_EVENT, onChange);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener(API_CHANGE_EVENT, onChange);
      window.removeEventListener("focus", load);
    };
  }, [load, path]);

  const create = useCallback(
    async (item: Partial<T>) => {
      const created = await apiSend<T>("POST", path, item);
      notifyApiChange(path);
      return created;
    },
    [path],
  );
  const update = useCallback(
    async (id: string, item: Partial<T>) => {
      const saved = await apiSend<T>("PUT", `${path}/${encodeURIComponent(id)}`, item);
      notifyApiChange(path);
      return saved;
    },
    [path],
  );
  const patch = useCallback(
    async (id: string, changes: Partial<T>) => {
      const saved = await apiSend<T>("PATCH", `${path}/${encodeURIComponent(id)}`, changes);
      notifyApiChange(path);
      return saved;
    },
    [path],
  );
  const remove = useCallback(
    async (id: string) => {
      await apiSend("DELETE", `${path}/${encodeURIComponent(id)}`);
      notifyApiChange(path);
    },
    [path],
  );

  const visible = error && !hasData.current ? fallbackOnError : items;
  return { items: visible, ready, error, reload: load, create, update, patch, remove };
}
