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
// Kanal pesanan yang diterima API (kolom orders.channel).
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
 * Pesanan, Reservasi, Katering
 * Dulu disimpan di localStorage browser, jadi pesanan dari HP pelanggan tidak pernah
 * sampai ke browser admin. Sekarang semuanya lewat PostgreSQL.
 * ========================================================================== */

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const ORDER_CHANNELS = Object.values(CHANNEL_LABEL);
const RESERVATION_STATUSES = ["Menunggu", "Dikonfirmasi", "Hadir", "Selesai", "Dibatalkan"];
const CATERING_STATUSES = ["Menunggu", "Penawaran", "Dikonfirmasi", "Produksi", "Selesai", "Dibatalkan"];
const MAX_ORDER_QTY = 100;

/** Jam & tanggal sekarang menurut APP_TIMEZONE (server Vercel berjalan di UTC). */
function localParts(date = new Date()) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: APP_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", hourCycle: "h23"
        }).formatToParts(date).map((p) => [p.type, p.value])
    );
    return { y: parts.year, m: parts.month, d: parts.day, hh: parts.hour, mm: parts.minute };
}
const jamMenit = (date) => { const p = localParts(date); return `${p.hh}:${p.mm}`; };
/** "25 Okt 2026" */
const tanggalPendek = (date) => { const p = localParts(date); return `${p.d} ${BULAN[Number(p.m) - 1]} ${p.y}`; };
/** "25 Okt 2026 · 14:05" */
const stempelWaktu = (date) => `${tanggalPendek(date)} · ${jamMenit(date)}`;
const todayIso = () => { const p = localParts(); return `${p.y}-${p.m}-${p.d}`; };
/** 79000 -> "Rp79.000" (sama dengan rupiah() di frontend) */
const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const toInt = (v, fallback = 0) => (v === undefined || v === null || v === "" ? fallback : Number(v));

/** "#LB-2611-007": nomor urut per bulan, dibuat backend supaya tidak bentrok antar-browser. */
async function nextMonthlyId(model, prefix) {
    const p = localParts();
    const head = `#${prefix}-${p.y.slice(2)}${p.m}-`;
    const rows = await prisma[model].findMany({ where: { id: { startsWith: head } }, select: { id: true } });
    const max = rows.reduce((n, r) => Math.max(n, Number(r.id.slice(head.length)) || 0), 0);
    return head + String(max + 1).padStart(3, "0");
}
async function createWithMonthlyId(model, prefix, data) {
    for (let attempt = 1; ; attempt++) {
        try {
            const id = await nextMonthlyId(model, prefix);
            return await prisma[model].create({ data: { ...data, id } });
        } catch (err) {
            if (isUniqueError(err) && attempt < 5) continue;
            throw err;
        }
    }
}

function limit(value, max, label) {
    if (value.length > max) throw bad(`${label} maksimal ${max} karakter`);
    return value;
}
function isoDate(value, label) {
    const v = text(value);
    if (!ISO_DATE.test(v) || isNaN(isoToDate(v))) throw bad(`${label} harus berformat YYYY-MM-DD`);
    return isoToDate(v);
}
function hhmm(value, label) {
    const v = text(value);
    if (!HHMM.test(v)) throw bad(`${label} harus berformat HH:MM`);
    return v;
}

/* ---------- Pesanan ---------- */

function orderOut(r) {
    return {
        id: r.id, customer: r.customer, phone: r.phone,
        items: Array.isArray(r.items) ? r.items : [],
        summary: r.summary, channel: r.channel, channelInfo: r.channelInfo,
        time: jamMenit(r.createdAt), date: tanggalPendek(r.createdAt),
        total: rupiah(r.total), subtotal: rupiah(r.subtotal), discount: rupiah(r.discount),
        status: r.status, payment: r.payment, paymentStatus: r.paymentStatus, note: r.note,
        timeline: Array.isArray(r.timeline) ? r.timeline : []
    };
}

/** Persen dari promo "Diskon Persen" bernilai "20%"; promo lain tidak memotong harga otomatis. */
function promoPercent(type, value) {
    if (type !== "Diskon Persen") return 0;
    const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(value || "");
    return m ? Math.min(100, Number(m[1].replace(",", "."))) : 0;
}

app.get("/api/orders", async (req, res) => {
    const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    res.json(rows.map(orderOut));
});

/**
 * Pesanan baru dari landing page atau admin.
 * Body: { customer, phone, channel, channelInfo?, payment?, note?, promoId?, items: [{ menuId, qty }] }
 * Harga dihitung ulang dari tabel menu & promo di database, bukan dipercaya dari browser.
 */
app.post("/api/orders", async (req, res) => {
    const b = req.body || {};
    const customer = limit(text(b.customer), 120, "Nama pelanggan");
    if (customer.length < 2) throw bad("Nama pelanggan wajib diisi");
    const phone = limit(text(b.phone), 30, "Nomor telepon");
    const channel = text(b.channel) || "Makan di Tempat";
    if (!ORDER_CHANNELS.includes(channel)) throw bad("Kanal pesanan tidak valid");

    const merged = new Map();
    for (const it of Array.isArray(b.items) ? b.items : []) {
        const menuId = text(it && it.menuId);
        const qty = Number(it && it.qty);
        if (!menuId) continue;
        if (!Number.isInteger(qty) || qty < 1) throw bad("Jumlah menu harus bilangan bulat minimal 1");
        merged.set(menuId, (merged.get(menuId) || 0) + qty);
    }
    if (merged.size === 0) throw bad("Pilih minimal satu menu");

    const menus = await prisma.menuItem.findMany({ where: { id: { in: [...merged.keys()] } } });
    const items = [];
    let subtotal = 0;
    for (const [menuId, qty] of merged) {
        const m = menus.find((x) => x.id === menuId);
        if (!m) throw bad("Ada menu yang sudah tidak tersedia. Muat ulang halaman.");
        if (!m.available) throw bad(`${m.name} sedang tidak tersedia`);
        if (qty > MAX_ORDER_QTY) throw bad(`Maksimal ${MAX_ORDER_QTY} porsi per menu`);
        if (qty > m.stock) throw bad(`Stok ${m.name} tinggal ${m.stock}`);
        items.push([m.name, qty, rupiah(m.price)]);
        subtotal += m.price * qty;
    }

    let promo = null;
    const promoId = text(b.promoId);
    if (promoId) {
        const p = await prisma.promo.findUnique({ where: { id: promoId } });
        const today = todayIso();
        if (p && p.active && p.website && dateToIso(p.startDate) <= today && dateToIso(p.endDate) >= today) promo = p;
    }
    const discount = promo ? Math.floor((subtotal * promoPercent(promo.type, promo.value)) / 100) : 0;
    const note = [limit(text(b.note), 500, "Catatan"), promo ? `Promo: ${promo.name}` : ""].filter(Boolean).join(" · ");
    const now = new Date();

    const created = await createWithMonthlyId("order", "LB", {
        customer, phone, channel,
        channelInfo: limit(text(b.channelInfo), 160, "Info kanal") || "-",
        items,
        summary: items.map(([n, q]) => `${n} ×${q}`).join(", "),
        subtotal, discount, total: subtotal - discount,
        status: "Baru",
        payment: limit(text(b.payment), 40, "Metode bayar") || "Bayar di kasir",
        paymentStatus: "BELUM BAYAR",
        note: note || "Tidak ada catatan.",
        timeline: [[jamMenit(now), "Pesanan diterima"]],
        createdAt: now
    });
    res.status(201).json(orderOut(created));
});

/**
 * Ubah status pesanan dari admin.
 * Body: { status?, paymentStatus?, timeline?: "Pesanan diproses" } -> timeline ditambah [jam sekarang, teks].
 */
async function updateOrder(req, res) {
    const current = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Pesanan tidak ditemukan");
    const b = req.body || {};
    const data = {};
    if (b.status !== undefined) {
        if (!ORDER_STATUSES.includes(b.status)) throw bad("Status pesanan tidak valid");
        data.status = b.status;
    }
    if (b.paymentStatus !== undefined) data.paymentStatus = limit(text(b.paymentStatus), 30, "Status bayar");
    const label = limit(text(b.timeline), 80, "Keterangan");
    if (label) data.timeline = [...(Array.isArray(current.timeline) ? current.timeline : []), [jamMenit(new Date()), label]];
    const updated = await prisma.order.update({ where: { id: current.id }, data });
    res.json(orderOut(updated));
}
app.patch("/api/orders/:id", updateOrder);
// Rute lama, tetap ada supaya tidak memutus kode lain.
app.patch("/api/orders/:id/status", updateOrder);

app.get("/api/order-summary", async (req, res) => {
    const groups = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
    const count = (status) => groups.find((g) => g.status === status)?._count._all || 0;
    res.json({
        baru: count("Baru"), diproses: count("Diproses"), siap: count("Siap"),
        selesai: count("Selesai"), dibatalkan: count("Dibatalkan")
    });
});

/* ---------- Reservasi ---------- */

function reservationOut(r) {
    return {
        id: r.id, customer: r.customer, phone: r.phone, date: dateToIso(r.date), time: r.time,
        pax: r.pax, table: r.tableName, area: r.area, source: r.source, status: r.status,
        occasion: r.occasion, note: r.note, createdAt: stempelWaktu(r.createdAt)
    };
}

function validateReservation(b) {
    const customer = limit(text(b.customer), 120, "Nama pemesan");
    if (customer.length < 2) throw bad("Nama pemesan wajib diisi");
    const pax = toInt(b.pax, 0);
    if (!Number.isInteger(pax) || pax < 1 || pax > 500) throw bad("Jumlah tamu harus 1 sampai 500");
    const status = text(b.status) || "Menunggu";
    if (!RESERVATION_STATUSES.includes(status)) throw bad("Status reservasi tidak valid");
    return {
        customer,
        phone: limit(text(b.phone), 30, "Nomor telepon"),
        date: isoDate(b.date, "Tanggal reservasi"),
        time: hhmm(b.time, "Jam reservasi"),
        pax,
        tableName: limit(text(b.table), 60, "Meja") || "Belum ditentukan",
        area: limit(text(b.area), 60, "Area"),
        source: limit(text(b.source), 30, "Sumber") || "Website",
        status,
        occasion: limit(text(b.occasion), 120, "Keperluan") || "Makan",
        note: text(b.note) || "Tidak ada catatan khusus."
    };
}

app.get("/api/reservations", async (req, res) => {
    const rows = await prisma.reservation.findMany({ orderBy: [{ date: "desc" }, { time: "desc" }] });
    res.json(rows.map(reservationOut));
});

app.post("/api/reservations", async (req, res) => {
    const v = validateReservation(req.body || {});
    const created = await createWithMonthlyId("reservation", "RS", v);
    res.status(201).json(reservationOut(created));
});

async function updateReservation(req, res) {
    const current = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Reservasi tidak ditemukan");
    const v = validateReservation({ ...reservationOut(current), ...(req.body || {}) });
    const updated = await prisma.reservation.update({ where: { id: current.id }, data: v });
    res.json(reservationOut(updated));
}
app.put("/api/reservations/:id", updateReservation);
app.patch("/api/reservations/:id", updateReservation);

app.delete("/api/reservations/:id", async (req, res) => {
    const { count } = await prisma.reservation.deleteMany({ where: { id: req.params.id } });
    if (!count) throw notFound("Reservasi tidak ditemukan");
    res.json({ message: "Reservasi dihapus" });
});

/* ---------- Katering ---------- */

function cateringOut(r) {
    return {
        id: r.id, customer: r.customer, pic: r.pic, phone: r.phone, date: dateToIso(r.date), time: r.time,
        pax: r.pax, event: r.event, service: r.service, package: r.packageName, address: r.address,
        total: r.total, dp: r.dp, source: r.source, status: r.status, note: r.note,
        createdAt: stempelWaktu(r.createdAt)
    };
}

function validateCatering(b) {
    const customer = limit(text(b.customer), 120, "Nama pemesan");
    if (customer.length < 2) throw bad("Nama pemesan atau instansi wajib diisi");
    const pax = toInt(b.pax, 0);
    if (!Number.isInteger(pax) || pax < 1 || pax > 5000) throw bad("Jumlah pax harus 1 sampai 5000");
    const total = toInt(b.total, 0);
    const dp = toInt(b.dp, 0);
    if (!Number.isInteger(total) || total < 0) throw bad("Total harus bilangan bulat 0 atau lebih");
    if (!Number.isInteger(dp) || dp < 0) throw bad("DP harus bilangan bulat 0 atau lebih");
    const status = text(b.status) || "Menunggu";
    if (!CATERING_STATUSES.includes(status)) throw bad("Status katering tidak valid");
    return {
        customer,
        pic: limit(text(b.pic), 120, "Nama PIC") || customer,
        phone: limit(text(b.phone), 30, "Nomor telepon"),
        date: isoDate(b.date, "Tanggal acara"),
        time: hhmm(b.time, "Jam antar"),
        pax,
        event: limit(text(b.event), 80, "Jenis acara"),
        service: limit(text(b.service), 40, "Layanan"),
        packageName: limit(text(b.package), 160, "Paket"),
        address: text(b.address),
        total, dp,
        source: limit(text(b.source), 30, "Sumber") || "Website",
        status,
        note: text(b.note) || "Tidak ada catatan."
    };
}

app.get("/api/catering", async (req, res) => {
    const rows = await prisma.catering.findMany({ orderBy: [{ date: "desc" }, { time: "desc" }] });
    res.json(rows.map(cateringOut));
});

app.post("/api/catering", async (req, res) => {
    const v = validateCatering(req.body || {});
    const created = await createWithMonthlyId("catering", "KT", v);
    res.status(201).json(cateringOut(created));
});

async function updateCatering(req, res) {
    const current = await prisma.catering.findUnique({ where: { id: req.params.id } });
    if (!current) throw notFound("Pesanan katering tidak ditemukan");
    const v = validateCatering({ ...cateringOut(current), ...(req.body || {}) });
    const updated = await prisma.catering.update({ where: { id: current.id }, data: v });
    res.json(cateringOut(updated));
}
app.put("/api/catering/:id", updateCatering);
app.patch("/api/catering/:id", updateCatering);

app.delete("/api/catering/:id", async (req, res) => {
    const { count } = await prisma.catering.deleteMany({ where: { id: req.params.id } });
    if (!count) throw notFound("Pesanan katering tidak ditemukan");
    res.json({ message: "Pesanan katering dihapus" });
});

/* ---------- Laporan ---------- */

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

app.get("/api/reports/chart", async (req, res) => {
    const range = resolveRange(req.query);
    if (!range) throw bad("Rentang tanggal tidak valid");

    const channel = req.query.channel && req.query.channel !== "Semua" ? String(req.query.channel) : null;
    if (channel && !ORDER_CHANNELS.includes(channel)) throw bad("Channel pesanan tidak valid");
    const monthly = range.period === "Tahun ini";

    // created_at disimpan sebagai timestamptz (UTC); dikonversi ke zona waktu toko sebelum dikelompokkan.
    const localTime = Prisma.sql`("created_at" AT TIME ZONE ${APP_TIMEZONE})`;
    const bucket = monthly
        ? Prisma.sql`to_char(${localTime}, 'YYYY-MM')`
        : Prisma.sql`to_char(${localTime}::date, 'YYYY-MM-DD')`;
    const channelClause = channel ? Prisma.sql`AND "channel" = ${channel}` : Prisma.empty;

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

module.exports = app;
if (!process.env.VERCEL) start();