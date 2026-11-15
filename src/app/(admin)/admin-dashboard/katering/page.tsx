"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { BookingEmpty, BookingTabs, BookingToolbar, WebsiteSyncPill } from "@/components/admin/booking";
import {
  CateringAgenda,
  CateringDetail,
  CateringEditor,
  CateringRow,
  CateringServiceSummary,
  CateringStats,
  type CateringPayload,
} from "@/components/admin/catering";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { useToast } from "@/components/ui/Toast";
import { DROPDOWN_OPTIONS } from "@/data";
import { useApiList } from "@/hooks/useApiList";
import { QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";
import { apiSend, errorMessage, notifyApiChange } from "@/lib/api";
import { bookingToday } from "@/lib/booking";
import {
  CATERING_FILTERS_DEFAULT,
  CATERING_NEXT,
  CATERING_TABS,
  cateringBase,
  filterCatering,
  type CateringFilters,
} from "@/lib/catering";
import type { Catering } from "@/types";

const PATH = "/api/catering";

/** pesanan kosong untuk form katering brus */
const blank = (): Catering => ({
  id: "",
  customer: "",
  pic: "",
  phone: "",
  date: bookingToday(),
  time: "12:00",
  pax: 20,
  event: "Acara Kantor",
  service: "Nasi Kotak",
  package: "",
  address: "",
  total: 0,
  dp: 0,
  source: "Admin",
  status: "Menunggu",
  note: "",
  createdAt: "",
});

function KateringContent() {
  const showToast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Data dari database, jadi permintaan dari landing page (HP pelanggan) langsung terlihat di sini.
  const { items: catering, ready, error: loadError, reload } = useApiList<Catering>(PATH);

  const [filters, setFilters] = useState<CateringFilters>(CATERING_FILTERS_DEFAULT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Catering | null>(null);

  // Ambil ulang tiap 20 detik supaya data baru dari website muncul tanpa refresh.
  useEffect(() => {
    const timer = window.setInterval(reload, 20000);
    return () => window.clearInterval(timer);
  }, [reload]);

  const handledQuick = useRef(false);
  useEffect(() => {
    if (handledQuick.current || params.get(QUICK_ACTION_PARAM) !== QUICK_ACTION_NEW) return;
    handledQuick.current = true;
    setEditing(blank());
    router.replace(pathname);
  }, [params, pathname, router]);

  const patchFilters = (patch: Partial<CateringFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const selected = catering.find((x) => x.id === selectedId) ?? null;

  const handleSave = async (payload: CateringPayload) => {
    if (!editing) return;
    try {
      if (editing.id) {
        await apiSend<Catering>("PUT", `${PATH}/${encodeURIComponent(editing.id)}`, payload);
        showToast(`${editing.id} berhasil diperbarui.`);
      } else {
        const saved = await apiSend<Catering>("POST", PATH, payload);
        showToast(`${saved.id} berhasil dibuat.`);
      }
      notifyApiChange(PATH);
      setEditing(null);
    } catch (err) {
      showToast(errorMessage(err, "Gagal menyimpan pesanan katering."));
    }
  };

  const setStatus = async (item: Catering, status: Catering["status"], message: string) => {
    try {
      await apiSend<Catering>("PATCH", `${PATH}/${encodeURIComponent(item.id)}`, { status });
      notifyApiChange(PATH);
      showToast(message);
    } catch (err) {
      showToast(errorMessage(err, "Gagal memperbarui status."));
    }
  };

  const advance = (c: Catering) => {
    const step = CATERING_NEXT[c.status];
    if (step) setStatus(c, step.status, `${c.id} diperbarui menjadi ${step.status}.`);
  };
  const cancel = (c: Catering) => setStatus(c, "Dibatalkan", `${c.id} dibatalkan.`);

  const base = cateringBase(catering, filters);
  const counts: Record<string, number> = { Semua: base.length };
  for (const c of base) counts[c.status] = (counts[c.status] ?? 0) + 1;
  const visible = filterCatering(catering, filters);

  return (
    <AdminPage id="page-katering">
      <PageHeading
        title="Kelola Katering"
        badge={<WebsiteSyncPill />}
        subtitle="Kelola permintaan nasi kotak dan prasmanan untuk pernikahan, acara kantor, arisan, dan syukuran."
        actions={
          <Button id="btn-add-catering" variant="pill" icon="plus" onClick={() => setEditing(blank())}>
            Katering Baru
          </Button>
        }
      />

      {loadError && (
        <p className="u-text-sm" role="alert" style={{ color: "#b42318" }}>
          {loadError}
        </p>
      )}

      <CateringStats
        catering={catering}
        onPickStatus={(status) => patchFilters({ status, date: "7 hari" })}
      />

      <div className="catering-overview-grid">
        <CateringAgenda catering={catering} onOpen={setSelectedId} />
        <CateringServiceSummary catering={catering} />
      </div>

      <section className="reveal catering-manager-shell" style={{ animationDelay: "260ms" }}>
        <BookingToolbar
          prefix="catering"
          placeholder="Cari ID, pelanggan, perusahaan, atau PIC..."
          search={filters.search}
          onSearch={(search) => patchFilters({ search })}
          onReset={() => setFilters(CATERING_FILTERS_DEFAULT)}
        >
          <FilterDropdown id="catering-service" value={filters.service} options={DROPDOWN_OPTIONS["catering-service"]}
            onChange={(service) => patchFilters({ service })} align="right"
            className="catering-filter-dropdown" ariaLabel="Filter layanan" />
          <FilterDropdown id="catering-date" value={filters.date} options={DROPDOWN_OPTIONS["catering-date"]}
            onChange={(date) => patchFilters({ date })} align="right"
            className="catering-filter-dropdown" ariaLabel="Filter tanggal" />
        </BookingToolbar>

        <BookingTabs prefix="catering" statuses={CATERING_TABS} active={filters.status}
          counts={counts} onChange={(status) => patchFilters({ status })} />

        <div className="w-100 overflow-auto">
          <div className="catering-table">
            <div className="catering-table-head">
              <span>ID</span><span>PELANGGAN</span><span>ACARA</span><span>JADWAL</span><span>PAX</span>
              <span>LAYANAN</span><span>TOTAL / DP</span><span>STATUS</span><span></span>
            </div>
            <div id="catering-rows">
              {visible.length === 0 && <BookingEmpty icon="package-x" title="Pesanan katering tidak ditemukan" />}
              {visible.map((c) => (
                <CateringRow key={c.id} catering={c} onOpen={() => setSelectedId(c.id)} />
              ))}
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between u-gap-3 u-pt-1">
          <p id="catering-count" className="u-text-xs ink60">
            {ready ? `Menampilkan ${visible.length} dari ${catering.length} pesanan katering` : "Memuat data katering…"}
          </p>
          <span className="table-footer-note">Gunakan filter untuk mempersempit data</span>
        </div>
      </section>

      {selected && !editing && (
        <CateringDetail
          catering={selected}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setEditing(selected); setSelectedId(null); }}
          onAdvance={() => advance(selected)}
          onCancel={() => cancel(selected)}
        />
      )}
      {editing && (
        <CateringEditor
          key={editing.id || "baru"}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </AdminPage>
  );
}

export default function KateringPage() {
  return (
    <Suspense fallback={null}>
      <KateringContent />
    </Suspense>
  );
}
