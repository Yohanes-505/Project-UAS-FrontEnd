# Lamak Bana (Next.js)

## Menjalankan

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3001
```

Backend (wajib untuk Menu, Kategori, Promo, Pengaturan, Bantuan, Pesanan, Reservasi, dan Katering) memakai **PostgreSQL + Prisma**.
Siapkan dulu server PostgreSQL (instal lokal, Docker, atau gratisan di Supabase/Neon) dan buat database kosong
`lamak_bana`. Lalu di terminal terpisah:

```bash
cd backend
cp .env.example .env     # Windows: copy .env.example .env  -> isi DATABASE_URL
npm install              # otomatis menjalankan `prisma generate`
npm run db:setup         # buat tabel (migrasi) + isi data awal, cukup sekali
npm start                # http://localhost:3000
```

Contoh PostgreSQL lewat Docker (cocok dengan `DATABASE_URL` bawaan di `.env.example`):

```bash
docker run --name lamak-bana-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lamak_bana -p 5432:5432 -d postgres:16
```

Perintah database lain (jalankan di folder `backend/`):

| Perintah | Fungsi |
| --- | --- |
| `npm run db:setup` | Menjalankan migrasi yang belum ada + seed. Jalankan juga setiap habis `git pull` yang membawa migrasi baru. |
| `npm run reset-db` | Hapus semua tabel, buat ulang, isi data awal lagi. **Semua data hilang.** |
| `npm run db:migrate -- --name nama_perubahan` | Setelah mengubah `prisma/schema.prisma`: buat file migrasi baru, lalu commit folder `prisma/migrations`. |
| `npm run db:studio` | Buka Prisma Studio untuk melihat/mengubah isi tabel di browser. |

Struktur tabel ada di `backend/prisma/schema.prisma`, riwayat perubahannya di `backend/prisma/migrations/`.
Jangan ubah tabel langsung lewat pgAdmin; ubah `schema.prisma` lalu buat migrasi supaya database semua anggota sama.
Seed hanya mengisi data awal kalau database masih kosong.
Tanggal promo contoh dihitung dari hari seed dijalankan (bukan tanggal tetap), jadi selalu sedang berjalan.
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
- Semua data lewat backend (PostgreSQL) sehingga admin dan landing sinkron di perangkat mana pun:
  Menu, Kategori, Promo, Pesanan, Reservasi, Katering lewat `useApiList("/api/...")`, Pengaturan lewat `useSettings()`.
  Jangan simpan data bisnis di localStorage: isinya hanya ada di browser itu sendiri, jadi pesanan dari HP
  pelanggan tidak akan pernah terlihat di laptop admin. localStorage sekarang hanya untuk status login.
- Endpoint: `GET/POST /api/orders`, `PATCH /api/orders/:id` (`{ status, paymentStatus, timeline }`),
  `GET/POST /api/reservations`, `PUT/PATCH/DELETE /api/reservations/:id`, `GET/POST /api/catering`,
  `PUT/PATCH/DELETE /api/catering/:id`. ID (`#LB-2611-001` dst.) dan harga pesanan dihitung backend.
  ID berisi `#`, jadi di URL selalu pakai `encodeURIComponent(id)`.
- Filter pakai `<FilterDropdown>`, panel detail/editor pakai `<Drawer>`, notifikasi pakai `useToast()`, form select pakai `<Select>`.
- Tombol "Pesanan/Reservasi/Katering Baru" di header membuka halaman dengan `?aksi=baru`; halaman tujuan langsung membuka form tambah.
- Satu orang satu branch, PR ke `main`.

## Deploy ke Vercel

1. **Backend** (Root Directory `backend`): isi Environment Variable `DATABASE_URL` (PostgreSQL online, mis. Neon/Supabase)
   dan `APP_TIMEZONE=Asia/Jakarta`. Server Vercel berjalan di UTC; jam pesanan dihitung dengan `APP_TIMEZONE`.
2. **Migrasi database produksi** (setiap ada folder baru di `backend/prisma/migrations`), dari komputer sendiri:
   ```bash
   cd backend
   DATABASE_URL="<url database produksi>" npm run db:deploy
   ```
   Tanpa langkah ini tabel `orders`, `reservations`, `catering` tidak ada dan pesanan gagal disimpan (error 500).
3. **Frontend** (Root Directory repo): isi `NEXT_PUBLIC_API_URL` dengan URL backend di Vercel
   (mis. `https://lamak-bana-api.vercel.app`, tanpa `/` di akhir), lalu **Redeploy**. Variabel `NEXT_PUBLIC_*`
   ditanam saat build, jadi mengubahnya tanpa redeploy tidak berpengaruh.
