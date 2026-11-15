-- Pindahkan Pesanan, Reservasi, dan Katering dari localStorage browser ke PostgreSQL.
--
-- Tabel "orders" lama (id SERIAL + enum) belum pernah dipakai frontend, jadi dibuang dan
-- dibuat ulang dengan bentuk yang sama dengan tipe Order di src/types/index.ts.

-- DropTable
DROP TABLE IF EXISTS "orders";

-- DropEnum
DROP TYPE IF EXISTS "order_channel";
DROP TYPE IF EXISTS "order_status";

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(30) NOT NULL,
    "customer" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL DEFAULT '',
    "items" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '',
    "channel" VARCHAR(40) NOT NULL DEFAULT 'Makan di Tempat',
    "channel_info" VARCHAR(160) NOT NULL DEFAULT '',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Baru',
    "payment" VARCHAR(40) NOT NULL DEFAULT 'Bayar di kasir',
    "payment_status" VARCHAR(30) NOT NULL DEFAULT 'BELUM BAYAR',
    "note" TEXT NOT NULL DEFAULT '',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" VARCHAR(30) NOT NULL,
    "customer" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL DEFAULT '',
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "table_name" VARCHAR(60) NOT NULL DEFAULT 'Belum ditentukan',
    "area" VARCHAR(60) NOT NULL DEFAULT '',
    "source" VARCHAR(30) NOT NULL DEFAULT 'Website',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
    "occasion" VARCHAR(120) NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catering" (
    "id" VARCHAR(30) NOT NULL,
    "customer" VARCHAR(120) NOT NULL,
    "pic" VARCHAR(120) NOT NULL DEFAULT '',
    "phone" VARCHAR(30) NOT NULL DEFAULT '',
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "event" VARCHAR(80) NOT NULL DEFAULT '',
    "service" VARCHAR(40) NOT NULL DEFAULT '',
    "package" VARCHAR(160) NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "total" INTEGER NOT NULL DEFAULT 0,
    "dp" INTEGER NOT NULL DEFAULT 0,
    "source" VARCHAR(30) NOT NULL DEFAULT 'Website',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "catering_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_orders_created" ON "orders"("created_at");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_channel" ON "orders"("channel");
CREATE INDEX "idx_reservations_date" ON "reservations"("date");
CREATE INDEX "idx_reservations_status" ON "reservations"("status");
CREATE INDEX "idx_catering_date" ON "catering"("date");
CREATE INDEX "idx_catering_status" ON "catering"("status");

-- Aturan CHECK (ditulis manual, Prisma belum mendukungnya di schema.prisma).
ALTER TABLE "orders"
    ADD CONSTRAINT "orders_amount_check" CHECK ("subtotal" >= 0 AND "discount" >= 0 AND "total" >= 0),
    ADD CONSTRAINT "orders_status_check" CHECK ("status" IN ('Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan'));
ALTER TABLE "reservations"
    ADD CONSTRAINT "reservations_pax_check" CHECK ("pax" >= 1),
    ADD CONSTRAINT "reservations_status_check" CHECK ("status" IN ('Menunggu', 'Dikonfirmasi', 'Hadir', 'Selesai', 'Dibatalkan'));
ALTER TABLE "catering"
    ADD CONSTRAINT "catering_amount_check" CHECK ("pax" >= 1 AND "total" >= 0 AND "dp" >= 0),
    ADD CONSTRAINT "catering_status_check" CHECK ("status" IN ('Menunggu', 'Penawaran', 'Dikonfirmasi', 'Produksi', 'Selesai', 'Dibatalkan'));
