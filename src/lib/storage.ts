/**
 * Key localStorage. JANGAN diganti namanya: landing page dan admin
 * saling membaca key yang sama supaya datanya sinkron.
 */
export const STORAGE_KEYS = {
  auth: "lamak-bana-admin-auth",
  orders: "lamak-bana-order-data",
  menu: "lamak-bana-menu-data",
  kategori: "lamak-bana-kategori-data",
  reservations: "lamak-bana-reservation-data",
  catering: "lamak-bana-catering-data",
  promo: "lamak-bana-promo-data",
  settings: "lamak-bana-settings",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Nama event untuk memberi tahu komponen lain di tab yang sama. */
export const LOCAL_STORAGE_EVENT = "lamak-bana-storage";

export interface LocalStorageEventDetail {
  key: string;
  source?: string;
}

const isBrowser = () => typeof window !== "undefined";

/** Baca JSON dari localStorage. Kalau kosong/rusak, kembalikan fallback. */
export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Simpan JSON ke localStorage, lalu kabari hook lain di tab yang sama. */
export function writeStorage<T>(key: string, value: T, source?: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent<LocalStorageEventDetail>(LOCAL_STORAGE_EVENT, { detail: { key, source } }),
    );
    return true;
  } catch (error) {
    // Biasanya kuota penuh (foto upload terlalu besar).
    console.warn(`Data "${key}" tidak dapat disimpan di localStorage.`, error);
    return false;
  }
}

/** Isi localStorage dengan data awal kalau key itu belum pernah ada. */
export function seedStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    if (window.localStorage.getItem(key) === null) writeStorage(key, value);
  } catch {
    /* abaikan */
  }
}
