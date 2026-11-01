"use client";

import { useCallback, useEffect, useState } from "react";
import { SETTINGS_DEFAULT } from "@/data/settings";
import { API_CHANGE_EVENT, apiGet, apiSend, errorMessage, notifyApiChange } from "@/lib/api";
import type { Settings } from "@/types";

const PATH = "/api/settings";

// Banyak komponen memakai useSettings sekaligus (sidebar, footer, ...).
// Permintaan yang sedang berjalan dipakai bersama supaya backend tidak dipanggil berkali-kali.
let inflight: Promise<Settings> | null = null;
function fetchSettings(): Promise<Settings> {
  if (!inflight) {
    inflight = apiGet<Settings>(PATH).finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

/**
 * Pengaturan admin (nama, jabatan, jam buka, dll) dari backend.
 *
 *   const [settings, save, ready, error] = useSettings();
 *
 * - `settings` selalu lengkap: nilai bawaan dipakai sampai data backend datang
 *   (atau selamanya kalau backend mati, supaya landing page tetap tampil).
 * - `ready` bernilai true setelah data backend berhasil dibaca.
 * - `save(next)` menyimpan ke database; melempar ApiError kalau ditolak backend.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULT);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchSettings()
        .then((data) => {
          if (!alive) return;
          setSettings({ ...SETTINGS_DEFAULT, ...data });
          setReady(true);
          setError(null);
        })
        .catch((err) => {
          if (alive) setError(errorMessage(err, "Gagal memuat pengaturan."));
        });
    };
    load();
    const onChange = (event: Event) => {
      if ((event as CustomEvent<{ path: string }>).detail?.path === PATH) load();
    };
    window.addEventListener(API_CHANGE_EVENT, onChange);
    window.addEventListener("focus", load);
    return () => {
      alive = false;
      window.removeEventListener(API_CHANGE_EVENT, onChange);
      window.removeEventListener("focus", load);
    };
  }, []);

  const save = useCallback(async (next: Settings): Promise<void> => {
    const saved = await apiSend<Settings>("PUT", PATH, next);
    setSettings({ ...SETTINGS_DEFAULT, ...saved });
    notifyApiChange(PATH);
  }, []);

  return [settings, save, ready, error] as const;
}
