// Konfigurasi Prisma CLI (Prisma 7). Dibaca oleh perintah `prisma ...`, bukan oleh server.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Nilai cadangan supaya `prisma generate` (dijalankan otomatis saat npm install)
    // tetap jalan walau .env belum dibuat. Perintah migrate/seed tetap butuh .env yang benar.
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/lamak_bana",
  },
});
