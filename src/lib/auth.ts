import { STORAGE_KEYS } from "./storage";

/*
 * Gerbang akses admin versi frontend untuk demo UTS.
 * Ini BUKAN autentikasi untuk produksi: siapa pun bisa mengubah
 * localStorage lewat DevTools.
 */
export const DEMO_USERNAME = "admin";
export const DEMO_PASSWORD = "lamakbana";

export const LOGIN_PATH = "/security-check";
export const ADMIN_PATH = "/admin-dashboard";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.auth) === "true";
  } catch {
    return false;
  }
}

/** Cek kredensial demo. Kalau cocok, tandai sudah login. */
export function login(username: string, password: string): boolean {
  if (username.trim() !== DEMO_USERNAME || password !== DEMO_PASSWORD) return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.auth, "true");
  } catch {
    return false;
  }
  return true;
}

export function logout() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.auth);
  } catch {
    /* abaikan */
  }
}
