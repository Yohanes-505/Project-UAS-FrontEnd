// Hapus file database lalu buat ulang dengan data awal: `npm run reset-db`
// Pastikan server (npm start) sedang TIDAK berjalan.
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(__dirname, process.env.DB_PATH || "./data/lamak_bana.db");
for (const suffix of ["", "-wal", "-shm"]) {
    if (fs.existsSync(dbPath + suffix)) fs.unlinkSync(dbPath + suffix);
}
const db = require("./database");   // membuat tabel + seed ulang
console.log("Database direset:", db.DB_PATH);
db.close();
