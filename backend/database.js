require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.resolve(__dirname, process.env.DB_PATH || "./data/lamak_bana.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 1) Buat tabel kalau belum ada.
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

// 2) Isi data awal sekali saja (menu, kategori, promo, pengaturan).
function seed() {
    const done = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
    if (done) return;

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));
    const flag = (v) => (v ? 1 : 0);
    // Tanggal promo di seed ditulis sebagai selisih hari dari hari ini (startDays/endDays),
    // supaya promo contoh selalu berada di periode yang benar, kapan pun database dibuat.
    const isoDay = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const insertMenu = db.prepare(
        `INSERT INTO menu_items
         (id, name, category, price, stock, available, website, featured, tone, description, image, sort_order)
         VALUES (@id, @name, @category, @price, @stock, @available, @website, @featured, @tone, @description, @image, @sort_order)`
    );
    const insertKategori = db.prepare(
        `INSERT INTO kategori
         (id, name, image, description, taste, spicy, menu_id, menu_name, visible, sort_order)
         VALUES (@id, @name, @image, @description, @taste, @spicy, @menu_id, @menu_name, @visible, @sort_order)`
    );
    const insertPromo = db.prepare(
        `INSERT INTO promos
         (id, name, type, value, start_date, end_date, active, website, description, image)
         VALUES (@id, @name, @type, @value, @start_date, @end_date, @active, @website, @description, @image)`
    );
    const insertSettings = db.prepare(
        `INSERT INTO settings
         (id, admin_name, admin_role, admin_email, store_name, store_phone, store_city, store_address,
          weekday_open, weekday_close, weekend_open, weekend_close,
          notif_order, notif_reservation, notif_catering, notif_stock)
         VALUES (1, @admin_name, @admin_role, @admin_email, @store_name, @store_phone, @store_city, @store_address,
          @weekday_open, @weekday_close, @weekend_open, @weekend_close,
          @notif_order, @notif_reservation, @notif_catering, @notif_stock)`
    );

    db.transaction(() => {
        data.menu.forEach((m, i) => insertMenu.run({
            id: m.id, name: m.name, category: m.category, price: m.price, stock: m.stock,
            available: flag(m.available), website: flag(m.website), featured: flag(m.featured),
            tone: m.tone || "rendang", description: m.desc || "",
            image: typeof m.image === "string" ? m.image : null, sort_order: i + 1
        }));
        data.kategori.forEach((k, i) => insertKategori.run({
            id: k.id, name: k.name, image: k.image || "", description: k.desc || "", taste: k.taste || "",
            spicy: k.spicy, menu_id: k.menuId || "", menu_name: k.menuName || "",
            visible: flag(k.visible), sort_order: i + 1
        }));
        data.promo.forEach((p) => insertPromo.run({
            id: p.id, name: p.name, type: p.type, value: p.value, start_date: p.start || isoDay(p.startDays), end_date: p.end || isoDay(p.endDays),
            active: flag(p.active), website: flag(p.website), description: p.desc || "",
            image: typeof p.image === "string" ? p.image : null
        }));
        const s = data.settings;
        insertSettings.run({
            admin_name: s.adminName, admin_role: s.adminRole, admin_email: s.adminEmail,
            store_name: s.storeName, store_phone: s.storePhone, store_city: s.storeCity, store_address: s.storeAddress,
            weekday_open: s.weekdayOpen, weekday_close: s.weekdayClose,
            weekend_open: s.weekendOpen, weekend_close: s.weekendClose,
            notif_order: flag(s.notifOrder), notif_reservation: flag(s.notifReservation),
            notif_catering: flag(s.notifCatering), notif_stock: flag(s.notifStock)
        });
        db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', datetime('now'))").run();
    })();

    console.log("Data awal dimasukkan ke database.");
}
seed();

module.exports = db;
module.exports.DB_PATH = DB_PATH;
