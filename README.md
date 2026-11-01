# Lamak Bana (Next.js)

## Menjalankan

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3001
```

Backend (wajib untuk Menu, Kategori, Promo, Pengaturan, dan Bantuan) — jalankan di terminal terpisah:

```bash
cd backend
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm start                # http://localhost:3000, database: backend/data/lamak_bana.db
```

Database SQLite dibuat otomatis saat pertama kali jalan, lengkap dengan data awal.
Kembalikan ke data awal: hentikan server, lalu `npm run reset-db`.
Tanggal promo contoh dihitung dari hari database dibuat (bukan tanggal tetap), jadi selalu sedang berjalan.
Promo di landing hanya tampil kalau toggle Aktif + Website menyala **dan** periodenya sedang berjalan (sama dengan label "Aktif" di admin).

Login admin demo: **admin / lamakbana** di `/security-check`.

## Pembagian folder

| bagian | File yang dikerjakan |
| Kenzie | `components/ui`, `components/admin`, `components/security`, `hooks`, `lib`, `types`, `data` (sudah selesai) |
| Nicho | `app/(landing)/page.tsx`, `components/landing/` |
| Elfrandt | `admin-dashboard/page.tsx`, `pesanan/`, `laporan/` |
| Khresnanda | `menu/`, `promo/`, `pengaturan/`, `bantuan/` |
| Yohanes | `reservasi/`, `katering/` |

## Checklist tugas

| Next.js, komponen terpisah | `src/components/ui`, `admin`, `security`, `landing` |
| Global CSS | `src/app/globals.css`, dimuat di setiap `layout.tsx` |
| Routing lewat `page.tsx` | `src/app/(landing)/page.tsx`, `(auth)/security-check/page.tsx`, `(admin)/admin-dashboard/**/page.tsx` |
| Functional component | semua komponen berupa fungsi |
| Props & children | mis. `<Drawer title=… footer=…>{children}</Drawer>`, `AdminShell`, `PageHeading`, semua `layout.tsx` |
| Bootstrap | `bootstrap@5.3.3`, dimuat di semua layout |

Folder `(landing)`, `(auth)`, `(admin)` adalah *route group*: tidak muncul di URL,
hanya memisahkan layout. URL tetap `/`, `/security-check`, `/admin-dashboard/...`.

## Aturan

- Semua CSS ada di `src/app/globals.css`, dibagi tiga bagian (LANDING PAGE, SECURITY CHECK,
  ADMIN DASHBOARD). Tiap aturan diawali `:where(body.landing-body)`, `:where(body.security-body)`,
  atau `:where(body.app-body)` supaya tidak bocor ke halaman lain. CSS baru ikuti pola yang sama.
  Nama class asli jangan diganti.
- Bootstrap: di admin dimuat biasa. Di landing & login dimuat lewat `src/styles/bootstrap-layer.css`
  + `bootstrap-compat.css` supaya tampilan identik dengan versi HTML. Jangan edit dua file itu.
- Data Menu, Kategori, dan Promo lewat `useApiList("/api/...")`, Pengaturan lewat `useSettings()`; keduanya
  membaca/menulis ke backend (SQLite) sehingga admin dan landing sinkron. Pesanan, Reservasi, dan Katering masih
  memakai `useLocalStorage(STORAGE_KEYS.xxx, DATA_DEFAULT)` sampai bagian itu dipindah ke backend.
- Filter pakai `<FilterDropdown>`, panel detail/editor pakai `<Drawer>`, notifikasi pakai `useToast()`, form select pakai `<Select>`.
- Tombol "Pesanan/Reservasi/Katering Baru" di header membuka halaman dengan `?aksi=baru`; halaman tujuan langsung membuka form tambah.
- Satu orang satu branch, PR ke `main`.
