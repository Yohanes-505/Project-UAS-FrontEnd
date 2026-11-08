// Prisma Client untuk PostgreSQL. Prisma 7 tersambung ke database lewat driver adapter (paket `pg`).
// Semua file yang butuh database cukup: const prisma = require("./prisma");
require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./generated/prisma");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur. Salin backend/.env.example menjadi backend/.env lalu isi koneksi PostgreSQL.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
