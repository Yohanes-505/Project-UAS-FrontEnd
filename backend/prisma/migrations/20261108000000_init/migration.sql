-- CreateEnum
CREATE TYPE "order_channel" AS ENUM ('Makan di Tempat', 'Ambil Sendiri', 'Ojek Online', 'Katering');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan');

-- CreateTable
CREATE TABLE "menu_items" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "website" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tone" VARCHAR(30) NOT NULL DEFAULT 'rendang',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "taste" VARCHAR(120) NOT NULL DEFAULT '',
    "spicy" SMALLINT NOT NULL DEFAULT 0,
    "menu_id" VARCHAR(20) NOT NULL DEFAULT '',
    "menu_name" VARCHAR(120) NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promos" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" VARCHAR(40) NOT NULL DEFAULT 'Diskon Persen',
    "value" VARCHAR(60) NOT NULL DEFAULT '',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "website" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "admin_name" VARCHAR(120) NOT NULL,
    "admin_role" VARCHAR(60) NOT NULL,
    "admin_email" VARCHAR(160) NOT NULL DEFAULT '',
    "store_name" VARCHAR(120) NOT NULL,
    "store_phone" VARCHAR(30) NOT NULL DEFAULT '',
    "store_city" VARCHAR(80) NOT NULL DEFAULT '',
    "store_address" TEXT NOT NULL DEFAULT '',
    "weekday_open" VARCHAR(5) NOT NULL,
    "weekday_close" VARCHAR(5) NOT NULL,
    "weekend_open" VARCHAR(5) NOT NULL,
    "weekend_close" VARCHAR(5) NOT NULL,
    "notif_order" BOOLEAN NOT NULL DEFAULT true,
    "notif_reservation" BOOLEAN NOT NULL DEFAULT true,
    "notif_catering" BOOLEAN NOT NULL DEFAULT true,
    "notif_stock" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_tickets" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "subject" VARCHAR(80) NOT NULL,
    "message" VARCHAR(400) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Baru',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30),
    "customer" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30),
    "channel" "order_channel" NOT NULL DEFAULT 'Makan di Tempat',
    "total" INTEGER NOT NULL DEFAULT 0,
    "status" "order_status" NOT NULL DEFAULT 'Baru',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_menu_category" ON "menu_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "idx_orders_created" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_orders_channel" ON "orders"("channel");
-- ---------------------------------------------------------------------------
-- Aturan CHECK (ditulis manual karena Prisma belum bisa mendefinisikannya di schema.prisma).
-- Sama dengan aturan di skema SQLite lama.
-- ---------------------------------------------------------------------------
ALTER TABLE "menu_items"
    ADD CONSTRAINT "menu_items_price_check" CHECK ("price" >= 0),
    ADD CONSTRAINT "menu_items_stock_check" CHECK ("stock" >= 0);

ALTER TABLE "kategori"
    ADD CONSTRAINT "kategori_spicy_check" CHECK ("spicy" BETWEEN 0 AND 3);

ALTER TABLE "promos"
    ADD CONSTRAINT "promos_period_check" CHECK ("end_date" >= "start_date");

ALTER TABLE "settings"
    ADD CONSTRAINT "settings_single_row_check" CHECK ("id" = 1);

ALTER TABLE "orders"
    ADD CONSTRAINT "orders_total_check" CHECK ("total" >= 0);
