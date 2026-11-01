require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const MAX_FEATURED_MENU = 3;
const ORDER_STATUSES = ["Baru", "Diproses", "Siap", "Selesai", "Dibatalkan"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // foto upload dikirim sebagai data URL

/* ============================== Helper ============================== */

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const bad = (message) => new HttpError(400, message);
const notFound = (message) => new HttpError(404, message);

/** true/false/1/0 -> boolean; kosong -> fallback. */
function toBool(value, fallback) {
    if (value === undefined || value === null) return fallback;
    if (value === true || value === 1 || value === "1" || value === "true") return true;
    if (value === false || value === 0 || value === "0" || value === "false") return false;
    return fallback;
}
const flag = (v) => (v ? 1 : 0);
const text = (v) => (v === undefined || v === null ? "" : String(v).trim());

/** "MN-" + nomor berikutnya, mis. MN-009. Dipanggil di dalam transaksi. */
function nextId(table, prefix) {
    const rows = db.prepare(`SELECT id FROM ${table}`).all();
    const max = rows.reduce((n, r) => Math.max(n, Number(String(r.id).replace(/\D/g, "")) || 0), 0);
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}
function nextSort(table) {
    return db.prepare(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM ${table}`).get().n;
}

/* ===================== Konversi baris DB <-> bentuk frontend ===================== */
/* Bentuk JSON sama persis dengan tipe di src/types/index.ts. */

function menuOut(r) {
    const item = {
        id: r.id, name: r.name, category: r.category, price: r.price, stock: r.stock,
        available: !!r.available, website: !!r.website, featured: !!r.featured,
        tone: r.tone, desc: r.description
    };
    if (r.image !== null) item.image = r.image;   // tanpa field image = pakai foto bawaan
    return item;
}
function kategoriOut(r) {
    return {
        id: r.id, name: r.name, image: r.image, desc: r.description, taste: r.taste, spicy: r.spicy,
        menuId: r.menu_id, menuName: r.menu_name, visible: !!r.visible
    };
}
function promoOut(r) {
    const item = {
        id: r.id, name: r.name, type: r.type, value: r.value, start: r.start_date, end: r.end_date,
        active: !!r.active, website: !!r.website, desc: r.description
    };
    if (r.image !== null) item.image = r.image;
    return item;
}
function settingsOut(r) {
    return {
        adminName: r.admin_name, adminRole: r.admin_role, adminEmail: r.admin_email,
        storeName: r.store_name, storePhone: r.store_phone, storeCity: r.store_city, storeAddress: r.store_address,
        weekdayOpen: r.weekday_open, weekdayClose: r.weekday_close,
        weekendOpen: r.weekend_open, weekendClose: r.weekend_close,
        notifOrder: !!r.notif_order, notifReservation: !!r.notif_reservation,
        notifCatering: !!r.notif_catering, notifStock: !!r.notif_stock
    };
}

/* ============================== Validasi ============================== */

function validateMenu(b, excludeId) {
    const name = text(b.name);
    const category = text(b.category);
    const price = Number(b.price);
    const stock = b.stock === undefined || b.stock === "" ? 0 : Number(b.stock);
    if (!name) throw bad("Nama menu wajib diisi");
    if (name.length > 120) throw bad("Nama menu maksimal 120 karakter");
    if (!category) throw bad("Kategori wajib diisi");
    if (!Number.isInteger(price) || price < 0) throw bad("Harga harus bilangan bulat 0 atau lebih");
    if (!Number.isInteger(stock) || stock < 0) throw bad("Stok harus bilangan bulat 0 atau lebih");

    const featured = toBool(b.featured, false);
    if (featured) {
        const others = db.prepare("SELECT name FROM menu_items WHERE featured = 1 AND id <> ?").all(excludeId || "");
        if (others.length >= MAX_FEATURED_MENU) {
            throw bad(`Menu Andalan maksimal ${MAX_FEATURED_MENU}. Matikan dulu salah satu: ${others.map((o) => o.name).join(", ")}.`);
        }
    }
    return {
        name, category, price, stock,
        available: flag(toBool(b.available, true)),
        website: flag(toBool(b.website, true)),
        featured: flag(featured),
        tone: text(b.tone) || "rendang",
        description: text(b.desc),
        image: typeof b.image === "string" ? b.image : null
    };
}

function validateKategori(b) {
    const name = text(b.name);
    const description = text(b.desc);
    const spicy = Number(b.spicy === undefined || b.spicy === "" ? 0 : b.spicy);
    if (!name) throw bad("Nama kategori wajib diisi");
    if (!description) throw bad("Info singkat kategori wajib diisi");
    if (!Number.isInteger(spicy) || spicy < 0 || spicy > 3) throw bad("Tingkat pedas harus 0 sampai 3");

    const menuId = text(b.menuId);
    let menuName = "";
    if (menuId) {
        const menu = db.prepare("SELECT name FROM menu_items WHERE id = ?").get(menuId);
        if (!menu) throw bad("Menu terkait tidak ditemukan");
        menuName = menu.name;
    }
    return {
        name, description, taste: text(b.taste), spicy, menu_id: menuId, menu_name: menuName,
        image: typeof b.image === "string" ? b.image : "",
        visible: flag(toBool(b.visible, true))
    };
}

function validatePromo(b) {
    const name = text(b.name);
    const start = text(b.start);
    const end = text(b.end);
    if (!name || !start || !end) throw bad("Nama promo dan periode wajib diisi");
    if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) throw bad("Format tanggal harus YYYY-MM-DD");
    if (end < start) throw bad("Tanggal berakhir tidak boleh sebelum tanggal mulai");
    return {
        name, type: text(b.type) || "Diskon Persen", value: text(b.value),
        start_date: start, end_date: end,
        active: flag(toBool(b.active, true)),
        website: flag(toBool(b.website, true)),
        description: text(b.desc),
        image: typeof b.image === "string" ? b.image : null
    };
}

function validateSettings(b) {
    const s = {
        adminName: text(b.adminName), adminRole: text(b.adminRole), adminEmail: text(b.adminEmail),
        storeName: text(b.storeName), storePhone: text(b.storePhone), storeCity: text(b.storeCity),
        storeAddress: text(b.storeAddress),
        weekdayOpen: text(b.weekdayOpen), weekdayClose: text(b.weekdayClose),
        weekendOpen: text(b.weekendOpen), weekendClose: text(b.weekendClose)
    };
    if (!s.adminName || !s.storeName) throw bad("Nama admin dan nama restoran wajib diisi");
    if (!s.adminRole) throw bad("Role admin wajib diisi");
    for (const key of ["weekdayOpen", "weekdayClose", "weekendOpen", "weekendClose"]) {
        if (!HHMM.test(s[key])) throw bad("Lengkapi jam operasional (format HH:MM)");
    }
    if (s.weekdayClose <= s.weekdayOpen || s.weekendClose <= s.weekendOpen) {
        throw bad("Jam tutup harus lebih akhir dari jam buka");
    }
    if (s.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.adminEmail)) throw bad("Format email tidak valid");
    return s;
}

/* ================================ Dasar ================================ */

app.get("/", (req, res) => res.send("Lamak Bana API Running (SQLite)"));

app.get("/api/health", (req, res) => {
    db.prepare("SELECT 1").get();
    res.json({ status: "ok", database: "sqlite" });
});

/* ============================== Menu Makanan ============================== */

const selectMenu = db.prepare("SELECT * FROM menu_items WHERE id = ?");

app.get("/api/menu", (req, res) => {
    const rows = db.prepare("SELECT * FROM menu_items ORDER BY sort_order ASC, id ASC").all();
    res.json(rows.map(menuOut));
});

app.post("/api/menu", (req, res) => {
    const v = validateMenu(req.body || {});
    const created = db.transaction(() => {
        const id = nextId("menu_items", "MN");
        db.prepare(
            `INSERT INTO menu_items
             (id, name, category, price, stock, available, website, featured, tone, description, image, sort_order)
             VALUES (@id, @name, @category, @price, @stock, @available, @website, @featured, @tone, @description, @image, @sort_order)`
        ).run({ ...v, id, sort_order: nextSort("menu_items") });
        return selectMenu.get(id);
    })();
    res.status(201).json(menuOut(created));
});

/** PUT = simpan semua field; PATCH = ubah sebagian saja (mis. toggle website). Keduanya digabung dengan data lama. */
function updateMenu(req, res) {
    const current = selectMenu.get(req.params.id);
    if (!current) throw notFound("Menu tidak ditemukan");
    const v = validateMenu({ ...menuOut(current), ...(req.body || {}) }, current.id);
    db.prepare(
        `UPDATE menu_items SET name=@name, category=@category, price=@price, stock=@stock,
         available=@available, website=@website, featured=@featured, tone=@tone,
         description=@description, image=@image, updated_at=datetime('now') WHERE id=@id`
    ).run({ ...v, id: current.id });
    res.json(menuOut(selectMenu.get(current.id)));
}
app.put("/api/menu/:id", updateMenu);
app.patch("/api/menu/:id", updateMenu);

app.delete("/api/menu/:id", (req, res) => {
    const result = db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
    if (!result.changes) throw notFound("Menu tidak ditemukan");
    res.json({ message: "Menu berhasil dihapus" });
});

/* ============================ Kategori Landing Page ============================ */

const selectKategori = db.prepare("SELECT * FROM kategori WHERE id = ?");

app.get("/api/kategori", (req, res) => {
    const rows = db.prepare("SELECT * FROM kategori ORDER BY sort_order ASC, id ASC").all();
    res.json(rows.map(kategoriOut));
});

app.post("/api/kategori", (req, res) => {
    const v = validateKategori(req.body || {});
    const created = db.transaction(() => {
        const id = nextId("kategori", "KAT");
        db.prepare(
            `INSERT INTO kategori
             (id, name, image, description, taste, spicy, menu_id, menu_name, visible, sort_order)
             VALUES (@id, @name, @image, @description, @taste, @spicy, @menu_id, @menu_name, @visible, @sort_order)`
        ).run({ ...v, id, sort_order: nextSort("kategori") });
        return selectKategori.get(id);
    })();
    res.status(201).json(kategoriOut(created));
});

// Harus didefinisikan sebelum "/api/kategori/:id".
// Body: { ids: ["KAT-002", "KAT-001", ...] } = urutan baru, semua ID harus ikut.
app.put("/api/kategori/order", (req, res) => {
    const ids = req.body && req.body.ids;
    const existing = db.prepare("SELECT id FROM kategori").all().map((r) => r.id);
    if (!Array.isArray(ids) || ids.length !== existing.length || !ids.every((id) => existing.includes(id))
        || new Set(ids).size !== ids.length) {
        throw bad("Daftar urutan kategori tidak valid");
    }
    const update = db.prepare("UPDATE kategori SET sort_order = ? WHERE id = ?");
    db.transaction(() => ids.forEach((id, i) => update.run(i + 1, id)))();
    res.json({ message: "Urutan kategori diperbarui" });
});

function updateKategori(req, res) {
    const current = selectKategori.get(req.params.id);
    if (!current) throw notFound("Kategori tidak ditemukan");
    const v = validateKategori({ ...kategoriOut(current), ...(req.body || {}) });
    db.prepare(
        `UPDATE kategori SET name=@name, image=@image, description=@description, taste=@taste, spicy=@spicy,
         menu_id=@menu_id, menu_name=@menu_name, visible=@visible, updated_at=datetime('now') WHERE id=@id`
    ).run({ ...v, id: current.id });
    res.json(kategoriOut(selectKategori.get(current.id)));
}
app.put("/api/kategori/:id", updateKategori);
app.patch("/api/kategori/:id", updateKategori);

app.delete("/api/kategori/:id", (req, res) => {
    const result = db.prepare("DELETE FROM kategori WHERE id = ?").run(req.params.id);
    if (!result.changes) throw notFound("Kategori tidak ditemukan");
    res.json({ message: "Kategori dihapus" });
});

/* ================================== Promo ================================== */

const selectPromo = db.prepare("SELECT * FROM promos WHERE id = ?");

app.get("/api/promo", (req, res) => {
    const rows = db.prepare("SELECT * FROM promos ORDER BY id ASC").all();
    res.json(rows.map(promoOut));
});

app.post("/api/promo", (req, res) => {
    const v = validatePromo(req.body || {});
    const created = db.transaction(() => {
        const id = nextId("promos", "PR");
        db.prepare(
            `INSERT INTO promos (id, name, type, value, start_date, end_date, active, website, description, image)
             VALUES (@id, @name, @type, @value, @start_date, @end_date, @active, @website, @description, @image)`
        ).run({ ...v, id });
        return selectPromo.get(id);
    })();
    res.status(201).json(promoOut(created));
});

function updatePromo(req, res) {
    const current = selectPromo.get(req.params.id);
    if (!current) throw notFound("Promo tidak ditemukan");
    const v = validatePromo({ ...promoOut(current), ...(req.body || {}) });
    db.prepare(
        `UPDATE promos SET name=@name, type=@type, value=@value, start_date=@start_date, end_date=@end_date,
         active=@active, website=@website, description=@description, image=@image,
         updated_at=datetime('now') WHERE id=@id`
    ).run({ ...v, id: current.id });
    res.json(promoOut(selectPromo.get(current.id)));
}
app.put("/api/promo/:id", updatePromo);
app.patch("/api/promo/:id", updatePromo);

app.delete("/api/promo/:id", (req, res) => {
    const result = db.prepare("DELETE FROM promos WHERE id = ?").run(req.params.id);
    if (!result.changes) throw notFound("Promo tidak ditemukan");
    res.json({ message: "Promo dihapus" });
});

/* ================================ Pengaturan ================================ */

app.get("/api/settings", (req, res) => {
    res.json(settingsOut(db.prepare("SELECT * FROM settings WHERE id = 1").get()));
});

// Dipakai juga oleh tombol "Reset" (frontend mengirim nilai default).
app.put("/api/settings", (req, res) => {
    const current = settingsOut(db.prepare("SELECT * FROM settings WHERE id = 1").get());
    const body = { ...current, ...(req.body || {}) };
    const s = validateSettings(body);
    db.prepare(
        `UPDATE settings SET admin_name=@adminName, admin_role=@adminRole, admin_email=@adminEmail,
         store_name=@storeName, store_phone=@storePhone, store_city=@storeCity, store_address=@storeAddress,
         weekday_open=@weekdayOpen, weekday_close=@weekdayClose, weekend_open=@weekendOpen, weekend_close=@weekendClose,
         notif_order=@notifOrder, notif_reservation=@notifReservation, notif_catering=@notifCatering,
         notif_stock=@notifStock, updated_at=datetime('now') WHERE id = 1`
    ).run({
        ...s,
        notifOrder: flag(toBool(body.notifOrder, true)),
        notifReservation: flag(toBool(body.notifReservation, true)),
        notifCatering: flag(toBool(body.notifCatering, true)),
        notifStock: flag(toBool(body.notifStock, true))
    });
    res.json(settingsOut(db.prepare("SELECT * FROM settings WHERE id = 1").get()));
});

/* ================================== Bantuan ================================== */

const HELP_CATEGORIES = ["Pesanan", "Menu Makanan", "Reservasi", "Katering", "Laporan", "Promo", "Lainnya"];
const HELP_SUBJECT_MAX = 80;
const HELP_MESSAGE_MAX = 400;

app.get("/api/help", (req, res) => {
    res.json(db.prepare("SELECT * FROM help_tickets ORDER BY id DESC").all());
});

app.post("/api/help", (req, res) => {
    const b = req.body || {};
    const category = text(b.category);
    const subject = text(b.subject);
    const message = text(b.message);
    if (!category || !subject || !message) throw bad("Lengkapi kategori, judul, dan detail kendala");
    if (!HELP_CATEGORIES.includes(category)) throw bad("Kategori bantuan tidak valid");
    if (subject.length > HELP_SUBJECT_MAX) throw bad(`Judul maksimal ${HELP_SUBJECT_MAX} karakter`);
    if (message.length > HELP_MESSAGE_MAX) throw bad(`Detail kendala maksimal ${HELP_MESSAGE_MAX} karakter`);

    const result = db.prepare("INSERT INTO help_tickets (category, subject, message) VALUES (?, ?, ?)")
        .run(category, subject, message);
    res.status(201).json({ message: "Pertanyaan berhasil dicatat", id: Number(result.lastInsertRowid) });
});

/* ============================================================================
 * Pesanan & laporan: bagian anggota lain. Dipindah dari MySQL ke SQLite apa adanya
 * (belum dipakai frontend, frontend masih membaca pesanan dari localStorage).
 * ========================================================================== */

function toDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function resolveRange(query) {
    const now = new Date();
    const period = query.period || "Bulan ini";
    let from;
    let to;

    if (period === "7 hari terakhir") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "Tahun ini") {
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
    } else if (period === "Rentang tanggal") {
        from = new Date(`${query.from}T00:00:00`);
        to = new Date(`${query.to}T00:00:00`);
        if (isNaN(from) || isNaN(to) || to < from) return null;
    } else {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    return { period, from: toDateString(from), to: toDateString(to) };
}

app.get("/api/orders", (req, res) => {
    res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
});

app.patch("/api/orders/:id/status", (req, res) => {
    const status = req.body && req.body.status;
    if (!ORDER_STATUSES.includes(status)) throw bad("Status pesanan tidak valid");
    const result = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    if (!result.changes) throw notFound("Pesanan tidak ditemukan");
    res.json({ message: "Status pesanan diperbarui" });
});

app.get("/api/order-summary", (req, res) => {
    const row = db.prepare(
        `SELECT
            COALESCE(SUM(status='Baru'), 0) AS baru,
            COALESCE(SUM(status='Diproses'), 0) AS diproses,
            COALESCE(SUM(status='Siap'), 0) AS siap,
            COALESCE(SUM(status='Selesai'), 0) AS selesai,
            COALESCE(SUM(status='Dibatalkan'), 0) AS dibatalkan
         FROM orders`
    ).get();
    res.json(row);
});

app.get("/api/reports/chart", (req, res) => {
    const range = resolveRange(req.query);
    if (!range) throw bad("Rentang tanggal tidak valid");

    const channel = req.query.channel && req.query.channel !== "Semua" ? req.query.channel : null;
    const monthly = range.period === "Tahun ini";
    const bucket = monthly ? "strftime('%Y-%m', created_at)" : "date(created_at)";

    const params = [range.from, range.to];
    let channelClause = "";
    if (channel) {
        channelClause = "AND channel = ?";
        params.push(channel);
    }

    const rows = db.prepare(
        `SELECT ${bucket} AS bucket,
                COUNT(*) AS orders,
                COALESCE(SUM(CASE WHEN status <> 'Dibatalkan' THEN total ELSE 0 END), 0) AS revenue
         FROM orders
         WHERE date(created_at) BETWEEN ? AND ?
         ${channelClause}
         GROUP BY bucket
         ORDER BY bucket ASC`
    ).all(...params);

    res.json({
        period: range.period, from: range.from, to: range.to, channel: channel || "Semua",
        interval: monthly ? "month" : "day", data: rows
    });
});

/* ============================ 404 & error handler ============================ */

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Ukuran data atau foto terlalu besar" });
    }
    if (err.status && err.status < 500) return res.status(err.status).json({ message: "Data yang dikirim tidak valid" });
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

/* ================================== Start ================================== */

const server = app.listen(PORT, () => {
    console.log(`SQLite: ${db.DB_PATH}`);
    console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
    server.close(() => {
        db.close();
        process.exit(0);
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
