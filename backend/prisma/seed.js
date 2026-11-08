// Isi data awal (menu, kategori, promo, pengaturan).
// Dijalankan oleh `npm run db:seed`, `npm run db:setup`, dan `npm run reset-db`.
//
// Aman dijalankan berulang: kalau baris pengaturan sudah ada, seed dilewati, jadi tabel yang
// sengaja dikosongkan admin tidak terisi lagi.
const fs = require("fs");
const path = require("path");
const prisma = require("../db");

// Tanggal promo di seed ditulis sebagai selisih hari dari hari ini (startDays/endDays),
// supaya promo contoh selalu berada di periode yang benar, kapan pun database dibuat.
function dayFromToday(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); // kolom DATE, tanpa jam
}
const isoToDate = (iso) => new Date(`${iso}T00:00:00.000Z`);

async function main() {
    if (await prisma.settings.findUnique({ where: { id: 1 } })) {
        console.log("Data awal sudah ada, seed dilewati.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

    await prisma.$transaction([
        prisma.menuItem.createMany({
            data: data.menu.map((m, i) => ({
                id: m.id, name: m.name, category: m.category, price: m.price, stock: m.stock,
                available: !!m.available, website: !!m.website, featured: !!m.featured,
                tone: m.tone || "rendang", description: m.desc || "",
                image: typeof m.image === "string" ? m.image : null, sortOrder: i + 1
            }))
        }),
        prisma.kategori.createMany({
            data: data.kategori.map((k, i) => ({
                id: k.id, name: k.name, image: k.image || "", description: k.desc || "", taste: k.taste || "",
                spicy: k.spicy, menuId: k.menuId || "", menuName: k.menuName || "",
                visible: !!k.visible, sortOrder: i + 1
            }))
        }),
        prisma.promo.createMany({
            data: data.promo.map((p) => ({
                id: p.id, name: p.name, type: p.type, value: p.value,
                startDate: p.start ? isoToDate(p.start) : dayFromToday(p.startDays),
                endDate: p.end ? isoToDate(p.end) : dayFromToday(p.endDays),
                active: !!p.active, website: !!p.website, description: p.desc || "",
                image: typeof p.image === "string" ? p.image : null
            }))
        }),
        prisma.settings.create({
            data: { id: 1, ...data.settings }
        })
    ]);

    console.log("Data awal dimasukkan ke database.");
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
