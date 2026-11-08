"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { BookingTabs, BookingToolbar } from "@/components/admin/booking";
import { OrderDetail, OrderEditor, OrderRow, OrderStats, type OrderPayload } from "@/components/admin/order";
import { jamMenit, nextId, tanggalPendek } from "@/components/landing/lib";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { DROPDOWN_OPTIONS, MENU_DATA_DEFAULT, ORDER_DATA_DEFAULT } from "@/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";
import { rupiah, rupiahNumber } from "@/lib/format";
import {
  filterOrders,
  ORDER_FILTERS_DEFAULT,
  ORDER_NEXT,
  ORDER_STATUS_PARAM,
  ORDER_TABS,
  ordersBase,
  type OrderFilters,
} from "@/lib/orders";
import { seedStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { MenuItem, Order, OrderStatus } from "@/types";

function PesananContent() {
  const showToast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [stored, , ready] = useLocalStorage<Order[]>(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);
  const orders = Array.isArray(stored) ? stored : ORDER_DATA_DEFAULT;
  const [storedMenu] = useLocalStorage<MenuItem[]>(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
  const menu = Array.isArray(storedMenu) ? storedMenu : MENU_DATA_DEFAULT;
  const initialStatus = params.get(ORDER_STATUS_PARAM);
  const [filters, setFilters] = useState<OrderFilters>(() => ({
    ...ORDER_FILTERS_DEFAULT,
    status: ORDER_TABS.includes(initialStatus as OrderStatus) ? (initialStatus as OrderStatus) : "Semua",
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT); }, [ready]);

  const handledQuick = useRef(false);
  useEffect(() => {
    if (handledQuick.current || params.get(QUICK_ACTION_PARAM) !== QUICK_ACTION_NEW) return;
    handledQuick.current = true;
    setCreating(true);
    router.replace(pathname);
  }, [params, pathname, router]);

  const patchFilters = (patch: Partial<OrderFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const persist = (next: Order[]): boolean => {
    if (writeStorage(STORAGE_KEYS.orders, next)) return true;
    showToast("Gagal menyimpan: penyimpanan browser penuh.");
    return false;
  };

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const handleCreate = (p: OrderPayload) => {
    const now = new Date();
    const id = nextId(orders.map((o) => o.id), "LB", now);
    const subtotal = p.items.reduce((sum, it) => sum + it[1] * rupiahNumber(it[2]), 0);
    const time = jamMenit(now);
    const order: Order = {
      ...p,
      id,
      summary: p.items.map(([n, q]) => `${n} ×${q}`).join(", "),
      time,
      date: tanggalPendek(now),
      subtotal: rupiah(subtotal),
      discount: "Rp0",
      total: rupiah(subtotal),
      status: "Baru",
      paymentStatus: "BELUM DIBAYAR",
      timeline: [[time, "Pesanan diterima"]],
    };
    if (!persist([order, ...orders])) return;
    showToast(`${id} berhasil dibuat.`);
    setCreating(false);
    setFilters((f) => ({ ...f, status: "Semua", date: "Hari ini", search: "" }));
  };

  const update = (o: Order, patch: Partial<Order>, label: string, message: string) => {
    const time = jamMenit(new Date());
    const next = orders.map((item) =>
      item.id === o.id ? { ...item, ...patch, timeline: [...item.timeline, [time, label] as [string, string]] } : item,
    );
    if (persist(next)) showToast(message);
  };

  const advance = (o: Order) => {
    const step = ORDER_NEXT[o.status];
    if (step) update(o, { status: step.status }, step.timeline, `${o.id} diperbarui menjadi “${step.status}”.`);
  };
  const cancel = (o: Order) =>
    update(o, { status: "Dibatalkan", paymentStatus: o.paymentStatus === "LUNAS" ? "REFUND" : o.paymentStatus },
      "Pesanan dibatalkan", `${o.id} dibatalkan.`);

  const base = ordersBase(orders, filters);
  const counts: Record<string, number> = { Semua: base.length };
  for (const o of base) counts[o.status] = (counts[o.status] ?? 0) + 1;
  const visible = filterOrders(orders, filters);

  return (
    <AdminPage id="page-pesanan">
      <PageHeading
        title="Kelola Pesanan"
        subtitle="Pantau, proses, dan selesaikan seluruh pesanan dari satu halaman."
        actions={<Button id="btn-new-order" variant="pill" icon="plus" onClick={() => setCreating(true)}>Pesanan Baru</Button>}
      />

      <OrderStats orders={orders} onPickStatus={(status) => patchFilters({ status, date: "Hari ini", channel: "Semua", search: "" })} />

      <section className="reveal d-flex w-100 flex-column u-gap-4 u-rounded-2xl u-border u-border-solid border-soft bg-white u-p-6" style={{ animationDelay: "240ms" }}>
        <BookingToolbar prefix="order" placeholder="Cari ID, pelanggan, atau menu..." search={filters.search}
          onSearch={(search) => patchFilters({ search })} onReset={() => setFilters(ORDER_FILTERS_DEFAULT)}>
          <FilterDropdown id="order-channel" value={filters.channel} options={DROPDOWN_OPTIONS["order-channel"]}
            onChange={(channel) => patchFilters({ channel })} align="right" className="order-filter-dropdown" ariaLabel="Filter kanal" />
          <FilterDropdown id="order-date" value={filters.date} options={DROPDOWN_OPTIONS["order-date"]}
            onChange={(date) => patchFilters({ date })} align="right" className="order-filter-dropdown" ariaLabel="Filter tanggal" />
        </BookingToolbar>

        <BookingTabs prefix="order" statuses={ORDER_TABS} active={filters.status} counts={counts}
          onChange={(status) => patchFilters({ status })} />

        <div className="w-100 overflow-x-auto">
          <div className="order-table-full">
            <div className="order-table-head">
              <p>ID PESANAN</p><p>PELANGGAN</p><p>PESANAN</p><p>KANAL</p><p>WAKTU</p>
              <p className="text-end">TOTAL</p><p>STATUS</p><p className="text-end">AKSI</p>
            </div>
            <div id="orders-full">
              {visible.length === 0 && (
                <div className="order-empty">
                  <Icon name="search-x" className="u-size-5" />
                  <p className="u-text-sm fw-medium u-text-ink">Pesanan tidak ditemukan</p>
                  <p className="u-text-xs ink60">Coba ubah kata pencarian atau filter.</p>
                </div>
              )}
              {visible.map((o) => <OrderRow key={o.id} order={o} onOpen={() => setSelectedId(o.id)} />)}
            </div>
          </div>
        </div>

        <div className="d-flex w-100 flex-wrap align-items-center justify-content-between u-gap-3">
          <p id="orders-count" className="u-text-xs u-leading-4 ink60">
            Menampilkan {visible.length} dari {orders.length} pesanan
          </p>
          <span className="table-footer-note">Gunakan filter untuk mempersempit data</span>
        </div>
      </section>

      {selected && !creating && (
        <OrderDetail order={selected} onClose={() => setSelectedId(null)}
          onAdvance={() => advance(selected)} onCancel={() => cancel(selected)} />
      )}
      {creating && <OrderEditor menu={menu} onClose={() => setCreating(false)} onSave={handleCreate} />}
    </AdminPage>
  );
}

export default function PesananPage() {
  return (
    <Suspense fallback={null}>
      <PesananContent />
    </Suspense>
  );
}