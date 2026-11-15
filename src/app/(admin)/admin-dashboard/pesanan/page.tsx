"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { BookingTabs, BookingToolbar } from "@/components/admin/booking";
import { OrderDetail, OrderEditor, OrderRow, OrderStats, type OrderPayload } from "@/components/admin/order";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { DROPDOWN_OPTIONS } from "@/data";
import { useApiList } from "@/hooks/useApiList";
import { QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";
import { apiSend, errorMessage, notifyApiChange } from "@/lib/api";
import {
  filterOrders,
  ORDER_FILTERS_DEFAULT,
  ORDER_NEXT,
  ORDER_STATUS_PARAM,
  ORDER_TABS,
  ordersBase,
  type OrderFilters,
} from "@/lib/orders";
import type { MenuItem, Order, OrderStatus } from "@/types";

const PATH = "/api/orders";

function PesananContent() {
  const showToast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Pesanan & menu dari database, jadi pesanan dari landing page (HP pelanggan) langsung terlihat di sini.
  const { items: orders, ready, error: loadError, reload } = useApiList<Order>(PATH);
  const { items: menu } = useApiList<MenuItem>("/api/menu");
  const initialStatus = params.get(ORDER_STATUS_PARAM);
  const [filters, setFilters] = useState<OrderFilters>(() => ({
    ...ORDER_FILTERS_DEFAULT,
    status: ORDER_TABS.includes(initialStatus as OrderStatus) ? (initialStatus as OrderStatus) : "Semua",
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Ambil ulang tiap 20 detik supaya pesanan baru dari website muncul tanpa refresh.
  useEffect(() => {
    const timer = window.setInterval(reload, 20000);
    return () => window.clearInterval(timer);
  }, [reload]);

  const handledQuick = useRef(false);
  useEffect(() => {
    if (handledQuick.current || params.get(QUICK_ACTION_PARAM) !== QUICK_ACTION_NEW) return;
    handledQuick.current = true;
    setCreating(true);
    router.replace(pathname);
  }, [params, pathname, router]);

  const patchFilters = (patch: Partial<OrderFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const handleCreate = async (p: OrderPayload) => {
    try {
      const order = await apiSend<Order>("POST", PATH, {
        customer: p.customer,
        phone: p.phone,
        channel: p.channel,
        channelInfo: p.channelInfo,
        payment: p.payment,
        note: p.note,
        items: p.lines,
      });
      notifyApiChange(PATH);
      showToast(`${order.id} berhasil dibuat.`);
      setCreating(false);
      setFilters((f) => ({ ...f, status: "Semua", date: "Hari ini", search: "" }));
    } catch (err) {
      showToast(errorMessage(err, "Gagal membuat pesanan."));
    }
  };

  const update = async (o: Order, patch: Partial<Pick<Order, "status" | "paymentStatus">>, label: string, message: string) => {
    try {
      await apiSend<Order>("PATCH", `${PATH}/${encodeURIComponent(o.id)}`, { ...patch, timeline: label });
      notifyApiChange(PATH);
      showToast(message);
    } catch (err) {
      showToast(errorMessage(err, "Gagal memperbarui pesanan."));
    }
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

      {loadError && (
        <p className="u-text-sm" role="alert" style={{ color: "#b42318" }}>
          {loadError}
        </p>
      )}

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
            {ready ? `Menampilkan ${visible.length} dari ${orders.length} pesanan` : "Memuat pesanan…"}
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