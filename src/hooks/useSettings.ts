"use client";

import { useMemo } from "react";
import { SETTINGS_DEFAULT } from "@/data/settings";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Settings } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Pengaturan admin (nama, jabatan, jam buka, dll).
 * Dipakai sidebar untuk nama admin, dan oleh halaman Pengaturan untuk menyimpan.
 */
export function useSettings() {
  const [saved, setSaved, ready] = useLocalStorage<Partial<Settings>>(STORAGE_KEYS.settings, {});
  const settings = useMemo<Settings>(() => ({ ...SETTINGS_DEFAULT, ...saved }), [saved]);
  return [settings, setSaved as (next: Settings) => void, ready] as const;
}
