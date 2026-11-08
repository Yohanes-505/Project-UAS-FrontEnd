require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./db");
const { Prisma } = require("./generated/prisma");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Zona waktu untuk mengelompokkan laporan per hari/bulan (kolom created_at disimpan dalam UTC).
const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Jakarta";

const MAX_FEATURED_MENU = 3;
const ORDER_STATUSES = ["Baru", "Diproses", "Siap", "Selesai", "Dibatalkan"];
// Enum Prisma OrderChannel -> teks yang dipakai API & database.
const CHANNEL_LABEL = {
    MakanDiTempat: "Makan di Tempat",
    AmbilSendiri: "Ambil Sendiri",
    OjekOnline: "Ojek Online",
    Katering: "Katering"
};
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
const text = (v) => (v === undefined || v === null ? "" : String(v).trim());

/** Kolom DATE PostgreSQL <-> teks "YYYY-MM-DD" di frontend. */
const dateToIso = (d) => d.toISOString().slice(0, 10);
const isoToDate = (iso) => new Date(`${iso}T00:00:00.000Z`);

const isUniqueError = (err) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

/** "MN-" + nomor berikutnya, mis. MN-009. */
async function nextId(model, prefix) {
    const rows = await prisma[model].findMany({ select: { id: true } });
    const max = rows.reduce((n, r) => Math.max(n, Number(String(r.id).replace(/\D/g, "")) || 0), 0);
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}
async function nextSort(model) {
    const { _max } = await prisma[model].aggregate({ _max: { sortOrder: true } });
    return (_max.sortOrder || 0) + 1;
}

/**
 * Buat baris baru dengan ID berikutnya. Kalau dua admin menyimpan bersamaan dan mendapat ID yang
 * sama, PostgreSQL menolak salah satunya (primary key bentrok), lalu dicoba lagi dengan ID baru.
 */
async function createWithNextId(model, prefix, data) {
    for (let attempt = 1; ; attempt++) {
        try {
            const id = await nextId(model, prefix);
            return await prisma[model].create({ data: { ...data, id } });
        } catch (err) {
            if (isUniqueError(err) && attempt < 3) continue;
            throw err;
        }
    }
}

/* ===================== Konversi baris DB <-> bentuk frontend ===================== */
/* Bentuk JSON sama persis dengan tipe di src/types/index.ts. */

function menuOut(r) {
    const item = {
        id: r.id, name: r.name, category: r.category, price: r.price, stock: r.stock,
        available: r.available, website: r.website, featured: r.featured,
        tone: r.tone, desc: r.description
    };
    if (r.image !== null) item.image = r.image;   // tanpa field image = pakai foto bawaan
    return item;
}
function kategoriOut(r) {
    return {
        id: r.id, name: r.name, image: r.image, desc: r.description, taste: r.taste, spicy: r.spicy,
        menuId: r.menuId, menuName: r.menuName, visible: r.visible
    };
}
function promoOut(r) {
    const item = {
        id: r.id, name: r.name, type: r.type, value: r.value,
        start: dateToIso(r.startDate), end: dateToIso(r.endDate),
        active: r.active, website: r.website, desc: r.description
    };
    if (r.image !== null) item.image = r.image;
    return item;
}
function settingsOut(r) {
    return {
        adminName: r.adminName, adminRole: r.adminRole, adminEmail: r.adminEmail,
        storeName: r.storeName, storePhone: r.storePhone, storeCity: r.storeCity, storeAddress: r.storeAddress,
        weekdayOpen: r.weekdayOpen, weekdayClose: r.weekdayClose,
        weekendOpen: r.weekendOpen, weekendClose: r.weekendClose,
        notifOrder: r.notifOrder, notifReservation: r.notifReservation,
        notifCatering: r.notifCatering, notifStock: r.notifStock
    };
}
function orderOut(r) {
    return {
        id: r.id, code: r.code, customer: r.customer, phone: r.phone,
        channel: CHANNEL_LABEL[r.channel], total: r.total, status: r.status, created_at: r.createdAt
    };
}
function helpOut(r) {
    return {
        id: r.id, category: r.category, subject: r.subject, message: r.message,
        status: r.status, created_at: r.createdAt
    };
}

/* ============================== Validasi ============================== */

async function validateMenu(b, excludeId) {
    const name = text(b.name);
    const category = text(b.category);
    const price = Number(b.price);
    const stock = b.stock === undefined || b.stock === "" ? 0 : Number(b.stock);
    if (!name) throw bad("Nama menu wajib diisi");
    if (name.length > 120) throw bad("Nama menu maksimal 120 karakter");
    if (!category) throw bad("Kategori wajib diisi");
    if (category.length > 60) throw bad("Kategori maksimal 60 karakter");
    if (!Number.isInteger(price) || price < 0) throw bad("Harga harus bilangan bulat 0 atau lebih");
    if (!Number.isInteger(stock) || stock < 0) throw bad("Stok harus bilangan bulat 0 atau lebih");

    const featured = toBool(b.featured, false);
    if (featured) {
        const others = await prisma.menuItem.findMany({
            where: { featured: true, id: { not: excludeId || "" } },
            select: { name: true }
        });
        if (others.length >= MAX_FEATURED_MENU) {
            throw bad(`Menu Andalan maksimal ${MAX_FEATURED_MENU}. Matikan dulu salah satu: ${others.map((o) => o.name).join(", ")}.`);
        }
    }
    return {
        name, category, price, stock,
        available: toBool(b.available, true),
        website: toBool(b.website, true),
        featured,
        tone: text(b.tone) || "rendang",
        description: text(b.desc),
        image: typeof b.image === "string" ? b.image : null
    };
}

async function validateKategori(b) {
    const name = text(b.name);
    const description = text(b.desc);
    const spicy = Number(b.spicy === undefined || b.spicy === "" ? 0 : b.spicy);
    if (!name) throw bad("Nama kategori wajib diisi");
    if (name.length > 120) throw bad("Nama kategori maksimal 120 karakter");
    if (!description) throw bad("Info singkat kategori wajib diisi");
    if (!Number.isInteger(spicy) || spicy < 0 || spicy > 3) throw bad("Tingkat pedas harus 0 sampai 3");
    const taste = text(b.taste);
    if (taste.length > 120) throw bad("Rasa maksimal 120 karakter");

    const menuId = text(b.menuId);
    let menuName = "";
    if (menuId) {
        const menu = await prisma.menuItem.findUnique({ where: { id: menuId }, select: { name: true } });
        if (!menu) throw bad("Menu terkait tidak ditemukan");
        menuName = menu.name;
    }
    return {
        name, description, taste, spicy, menuId, menuName,
        image: typeof b.image === "string" ? b.image : "",
        visible: toBool(b.visible, true)
    };
}

function validatePromo(b) {
    const name = text(b.name);
    const start = text(b.start);
    const end = text(b.end);
    if (!name || !start || !end) throw bad("Nama promo dan periode wajib diisi");
    if (name.length > 120) throw bad("Nama promo maksimal 120 karakter");
    if (!ISO_DATE.test(start) || !ISO_DATE.test(end)
        || isNaN(isoToDate(start)) || isNaN(isoToDate(end))) throw bad("Format tanggal harus YYYY-MM-DD");
    if (end < start) throw bad("Tanggal berakhir tidak boleh sebelum tanggal mulai");
    const value = text(b.value);
    if (value.length > 60) throw bad("Nilai promo maksimal 60 karakter");
    return {
        name, type: text(b.type) || "Diskon Persen", value,
        startDate: isoToDate(start), endDate: isoToDate(end),
        active: toBool(b.active, true),
        website: toBool(b.website, true),
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
    const limits = { adminName: 120, adminRole: 60, adminEmail: 160, storeName: 120, storePhone: 30, storeCity: 80 };
    for (const [key, max] of Object.entries(limits)) {
        if (s[key].length > max) throw bad(`Isian terlalu panjang (maksimal ${max} karakter)`);
    }
    return s;
}

/* ================================ Dasar ================================ */

app.get("/", (req, res) => res.send("Lamak Bana API Running (PostgreSQL + Prisma)"));

app.get("/api/health", async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "postgresql" });
});

/* ============================== Menu Makanan ============================== */

app.get("/api/menu", async (req, res) => {
    const rows = await prisma.menuItem.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
    res.json(rows.map(menuOut));
});

app.post("/api/menu", async (req, res) => {
    const v = await validateMenu(req.body || {});
    const created = await createWithNextId("menuItem", "MN", { ...v, sortOrder: await nextSort("menuItem") });
    res.status(201).json(menuOut(created));
});

/** PUT = simpan semua field; PATCH = ubah sebagian saja (mis. toggle website). Keduanya digabung dengan data lama. */
async function updateMenu(req, res) {
    const current = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Menu tidak ditemukan");
    const v = await validateMenu({ ...menuOut(current), ...(req.body || {}) }, current.id);
    const updated = await prisma.menuItem.update({ where: { id: current.id }, data: v });
    res.json(menuOut(updated));
}
app.put("/api/menu/:id", updateMenu);
app.patch("/api/menu/:id", updateMenu);

app.delete("/api/menu/:id", async (req, res) => {
    const { count } = await prisma.menuItem.deleteMany({ where: { id: req.params.id } });
    if (!count) throw notFound("Menu tidak ditemukan");
    res.json({ message: "Menu berhasil dihapus" });
});

/* ============================ Kategori Landing Page ============================ */

app.get("/api/kategori", async (req, res) => {
    const rows = await prisma.kategori.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
    res.json(rows.map(kategoriOut));
});

app.post("/api/kategori", async (req, res) => {
    const v = await validateKategori(req.body || {});
    const created = await createWithNextId("kategori", "KAT", { ...v, sortOrder: await nextSort("kategori") });
    res.status(201).json(kategoriOut(created));
});

// Harus didefinisikan sebelum "/api/kategori/:id".
// Body: { ids: ["KAT-002", "KAT-001", ...] } = urutan baru, semua ID harus ikut.
app.put("/api/kategori/order", async (req, res) => {
    const ids = req.body && req.body.ids;
    const existing = (await prisma.kategori.findMany({ select: { id: true } })).map((r) => r.id);
    if (!Array.isArray(ids) || ids.length !== existing.length || !ids.every((id) => existing.includes(id))
        || new Set(ids).size !== ids.length) {
        throw bad("Daftar urutan kategori tidak valid");
    }
    await prisma.$transaction(
        ids.map((id, i) => prisma.kategori.update({ where: { id }, data: { sortOrder: i + 1 } }))
    );
    res.json({ message: "Urutan kategori diperbarui" });
});

async function updateKategori(req, res) {
    const current = await prisma.kategori.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Kategori tidak ditemukan");
    const v = await validateKategori({ ...kategoriOut(current), ...(req.body || {}) });
    const updated = await prisma.kategori.update({ where: { id: current.id }, data: v });
    res.json(kategoriOut(updated));
}
app.put("/api/kategori/:id", updateKategori);
app.patch("/api/kategori/:id", updateKategori);

app.delete("/api/kategori/:id", async (req, res) => {
    const { count } = await prisma.kategori.deleteMany({ where: { id: req.params.id } });
    if (!count) throw notFound("Kategori tidak ditemukan");
    res.json({ message: "Kategori dihapus" });
});

/* ================================== Promo ================================== */

app.get("/api/promo", async (req, res) => {
    const rows = await prisma.promo.findMany({ orderBy: { id: "asc" } });
    res.json(rows.map(promoOut));
});

app.post("/api/promo", async (req, res) => {
    const v = validatePromo(req.body || {});
    const created = await createWithNextId("promo", "PR", v);
    res.status(201).json(promoOut(created));
});

async function updatePromo(req, res) {
    const current = await prisma.promo.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Promo tidak ditemukan");
    const v = validatePromo({ ...promoOut(current), ...(req.body || {}) });
    const updated = await prisma.promo.update({ where: { id: current.id }, data: v });
    res.json(promoOut(updated));
}
app.put("/api/promo/:id", updatePromo);
app.patch("/api/promo/:id", updatePromo);

app.delete("/api/promo/:id", async (req, res) => {
    const { count } = await prisma.promo.deleteMany({ where: { id: req.params.id } });
    if (!count) throw notFound("Promo tidak ditemukan");
    res.json({ message: "Promo dihapus" });
});

/* ================================ Pengaturan ================================ */

async function getSettingsRow() {
    const row = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!row) {
        throw new HttpError(503, "Data pengaturan belum ada. Jalankan: cd backend && npm run db:seed");
    }
    return row;
}

app.get("/api/settings", async (req, res) => {
    res.json(settingsOut(await getSettingsRow()));
});

// Dipakai juga oleh tombol "Reset" (frontend mengirim nilai default).
app.put("/api/settings", async (req, res) => {
    const current = settingsOut(await getSettingsRow());
    const body = { ...current, ...(req.body || {}) };
    const s = validateSettings(body);
    const updated = await prisma.settings.update({
        where: { id: 1 },
        data: {
            ...s,
            notifOrder: toBool(body.notifOrder, true),
            notifReservation: toBool(body.notifReservation, true),
            notifCatering: toBool(body.notifCatering, true),
            notifStock: toBool(body.notifStock, true)
        }
    });
    res.json(settingsOut(updated));
});

/* ================================== Bantuan ================================== */

const HELP_CATEGORIES = ["Pesanan", "Menu Makanan", "Reservasi", "Katering", "Laporan", "Promo", "Lainnya"];
const HELP_SUBJECT_MAX = 80;
const HELP_MESSAGE_MAX = 400;

app.get("/api/help", async (req, res) => {
    const rows = await prisma.helpTicket.findMany({ orderBy: { id: "desc" } });
    res.json(rows.map(helpOut));
});

app.post("/api/help", async (req, res) => {
    const b = req.body || {};
    const category = text(b.category);
    const subject = text(b.subject);
    const message = text(b.message);
    if (!category || !subject || !message) throw bad("Lengkapi kategori, judul, dan detail kendala");
    if (!HELP_CATEGORIES.includes(category)) throw bad("Kategori bantuan tidak valid");
    if (subject.length > HELP_SUBJECT_MAX) throw bad(`Judul maksimal ${HELP_SUBJECT_MAX} karakter`);
    if (message.length > HELP_MESSAGE_MAX) throw bad(`Detail kendala maksimal ${HELP_MESSAGE_MAX} karakter`);

    const ticket = await prisma.helpTicket.create({ data: { category, subject, message } });
    res.status(201).json({ message: "Pertanyaan berhasil dicatat", id: ticket.id });
});

/* ============================================================================
 * Pesanan & laporan: bagian anggota lain. Dipindah ke PostgreSQL apa adanya
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

app.get("/api/orders", async (req, res) => {
    const rows = await prisma.order.findMany({ orderBy: { id: "desc" } });
    res.json(rows.map(orderOut));
});

app.patch("/api/orders/:id/status", async (req, res) => {
    const status = req.body && req.body.status;
    if (!ORDER_STATUSES.includes(status)) throw bad("Status pesanan tidak valid");
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw notFound("Pesanan tidak ditemukan");
    const { count } = await prisma.order.updateMany({ where: { id }, data: { status } });
    if (!count) throw notFound("Pesanan tidak ditemukan");
    res.json({ message: "Status pesanan diperbarui" });
});

app.get("/api/order-summary", async (req, res) => {
    const groups = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
    const count = (status) => groups.find((g) => g.status === status)?._count._all || 0;
    res.json({
        baru: count("Baru"), diproses: count("Diproses"), siap: count("Siap"),
        selesai: count("Selesai"), dibatalkan: count("Dibatalkan")
    });
});

app.get("/api/reports/chart", async (req, res) => {
    const range = resolveRange(req.query);
    if (!range) throw bad("Rentang tanggal tidak valid");

    const channel = req.query.channel && req.query.channel !== "Semua" ? String(req.query.channel) : null;
    if (channel && !Object.values(CHANNEL_LABEL).includes(channel)) throw bad("Channel pesanan tidak valid");
    const monthly = range.period === "Tahun ini";

    // created_at disimpan sebagai timestamptz (UTC); dikonversi ke zona waktu toko sebelum dikelompokkan.
    const localTime = Prisma.sql`("created_at" AT TIME ZONE ${APP_TIMEZONE})`;
    const bucket = monthly
        ? Prisma.sql`to_char(${localTime}, 'YYYY-MM')`
        : Prisma.sql`to_char(${localTime}::date, 'YYYY-MM-DD')`;
    const channelClause = channel ? Prisma.sql`AND "channel" = CAST(${channel} AS "order_channel")` : Prisma.empty;

    const rows = await prisma.$queryRaw`
        SELECT ${bucket} AS bucket,
               COUNT(*)::int AS orders,
               COALESCE(SUM(CASE WHEN "status" <> 'Dibatalkan' THEN "total" ELSE 0 END), 0)::int AS revenue
        FROM "orders"
        WHERE ${localTime}::date BETWEEN ${range.from}::date AND ${range.to}::date
        ${channelClause}
        GROUP BY 1
        ORDER BY 1 ASC`;

    res.json({
        period: range.period, from: range.from, to: range.to, channel: channel || "Semua",
        interval: monthly ? "month" : "day", data: rows
    });
});

/* ============================ 404 & error handler ============================ */

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

/** true kalau error berasal dari koneksi ke PostgreSQL (server mati, password salah, dll.). */
function isDatabaseDown(err) {
    if (err instanceof Prisma.PrismaClientInitializationError) return true;
    // P1000 = login gagal, P1001 = server tidak terjangkau, P1003 = database tidak ada, P1017 = koneksi ditutup.
    const codes = ["P1000", "P1001", "P1002", "P1003", "P1017", "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"];
    return codes.includes(err.code) || codes.includes(err.cause && err.cause.code);
}

app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Ukuran data atau foto terlalu besar" });
    }
    if (err.status && err.status < 500) return res.status(err.status).json({ message: "Data yang dikirim tidak valid" });
    if (isUniqueError(err)) return res.status(409).json({ message: "Data bentrok dengan data lain. Coba simpan lagi." });
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    console.error(err);
    if (isDatabaseDown(err)) {
        return res.status(503).json({ message: "Database PostgreSQL tidak bisa dihubungi. Cek DATABASE_URL di backend/.env." });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

/* ================================== Start ================================== */

async function start() {
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
        console.error("Gagal terhubung ke PostgreSQL. Cek DATABASE_URL di backend/.env dan pastikan server PostgreSQL menyala.");
        console.error(err.message);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        const { host, pathname } = new URL(process.env.DATABASE_URL);
        console.log(`PostgreSQL: ${host}${pathname}`);
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
        server.close(async () => {
            await prisma.$disconnect();
            process.exit(0);
        });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start();
