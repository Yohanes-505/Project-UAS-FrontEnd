-- Skema SQLite Lamak Bana.
-- Dijalankan otomatis oleh database.js setiap server start (CREATE TABLE IF NOT EXISTS,
-- jadi aman dijalankan berulang). Boleh juga dibuka manual lewat DB Browser for SQLite.
--
-- Catatan: kolom boolean disimpan sebagai INTEGER 0/1 (SQLite tidak punya tipe boolean).
-- ID memakai teks berformat sama dengan frontend (MN-001, KAT-001, PR-001)
-- supaya relasi Kategori -> Menu (menu_id) tetap cocok.

PRAGMA foreign_keys = ON;

-- ---------- Menu Makanan ----------
CREATE TABLE IF NOT EXISTS menu_items (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    available   INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
    website     INTEGER NOT NULL DEFAULT 1 CHECK (website IN (0, 1)),
    featured    INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    tone        TEXT NOT NULL DEFAULT 'rendang',
    description TEXT NOT NULL DEFAULT '',
    -- NULL = belum diatur admin (frontend pakai foto bawaan menurut nama),
    -- ''   = sengaja tanpa foto, selain itu path foto atau data URL hasil upload.
    image       TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items (category);

-- ---------- Kategori Landing Page ----------
CREATE TABLE IF NOT EXISTS kategori (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    image       TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    taste       TEXT NOT NULL DEFAULT '',
    spicy       INTEGER NOT NULL DEFAULT 0 CHECK (spicy BETWEEN 0 AND 3),
    menu_id     TEXT NOT NULL DEFAULT '',   -- menu terkait (boleh kosong)
    menu_name   TEXT NOT NULL DEFAULT '',
    visible     INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1)),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Promo ----------
CREATE TABLE IF NOT EXISTS promos (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'Diskon Persen',
    value       TEXT NOT NULL DEFAULT '',
    start_date  TEXT NOT NULL,              -- format ISO YYYY-MM-DD
    end_date    TEXT NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    website     INTEGER NOT NULL DEFAULT 1 CHECK (website IN (0, 1)),
    description TEXT NOT NULL DEFAULT '',
    image       TEXT,                       -- arti NULL / '' sama seperti menu_items.image
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (end_date >= start_date)
);

-- ---------- Pengaturan (selalu satu baris, id = 1) ----------
CREATE TABLE IF NOT EXISTS settings (
    id                 INTEGER PRIMARY KEY CHECK (id = 1),
    admin_name         TEXT NOT NULL,
    admin_role         TEXT NOT NULL,
    admin_email        TEXT NOT NULL DEFAULT '',
    store_name         TEXT NOT NULL,
    store_phone        TEXT NOT NULL DEFAULT '',
    store_city         TEXT NOT NULL DEFAULT '',
    store_address      TEXT NOT NULL DEFAULT '',
    weekday_open       TEXT NOT NULL,
    weekday_close      TEXT NOT NULL,
    weekend_open       TEXT NOT NULL,
    weekend_close      TEXT NOT NULL,
    notif_order        INTEGER NOT NULL DEFAULT 1 CHECK (notif_order IN (0, 1)),
    notif_reservation  INTEGER NOT NULL DEFAULT 1 CHECK (notif_reservation IN (0, 1)),
    notif_catering     INTEGER NOT NULL DEFAULT 1 CHECK (notif_catering IN (0, 1)),
    notif_stock        INTEGER NOT NULL DEFAULT 1 CHECK (notif_stock IN (0, 1)),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Bantuan: pertanyaan dari form "Masih Butuh Bantuan?" ----------
CREATE TABLE IF NOT EXISTS help_tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT NOT NULL,
    subject     TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Baru',
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ---------- Pesanan (bagian anggota lain; dipindah dari MySQL, belum dipakai frontend) ----------
CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT UNIQUE,
    customer    TEXT NOT NULL,
    phone       TEXT,
    channel     TEXT NOT NULL DEFAULT 'Makan di Tempat'
                CHECK (channel IN ('Makan di Tempat', 'Ambil Sendiri', 'Ojek Online', 'Katering')),
    total       INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    status      TEXT NOT NULL DEFAULT 'Baru'
                CHECK (status IN ('Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders (channel);

-- Penanda: data awal (seed) hanya dimasukkan sekali, jadi tabel yang sengaja
-- dikosongkan admin tidak terisi lagi setiap server restart.
CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
