/** Alamat backend Express. Atur di .env.local (lihat .env.example). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Error dari backend; `message` sudah berbahasa Indonesia dan siap ditampilkan di toast. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke backend. Jalankan dulu: cd backend && npm start");
  }

  if (!response.ok) {
    let message = `Permintaan ${path} gagal (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      /* body bukan JSON, pakai pesan bawaan */
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiSend = <T>(method: Exclude<Method, "GET">, path: string, body?: unknown) =>
  request<T>(method, path, body);

/** Ambil pesan yang aman ditampilkan dari error apa pun. */
export function errorMessage(error: unknown, fallback = "Terjadi kesalahan. Coba lagi."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/* ---------- Sinkronisasi antar komponen ---------- */

/** Event di window: "data di path ini baru berubah, ambil ulang". */
export const API_CHANGE_EVENT = "lamak-bana-api-change";

export function notifyApiChange(path: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ path: string }>(API_CHANGE_EVENT, { detail: { path } }));
}
