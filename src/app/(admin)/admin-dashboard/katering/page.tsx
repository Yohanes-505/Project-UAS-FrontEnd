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
import { CATERING_DATA_DEFAULT, DROPDOWN_OPTIONS } from "@/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";
import { DEMO_TODAY } from "@/lib/booking";
import {
  CATERING_FILTERS_DEFAULT,
  CATERING_NEXT,
  CATERING_TABS,
  cateringBase,
  filterCatering,
  nextCateringId,
  type CateringFilters,
} from "@/lib/catering";
import { seedStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { Catering } from "@/types";

/** pesanan kosong untuk form katering brus */
const BLANK: Catering = {
  id: "",
  customer: "",
  pic: "",
  phone: "",
  date: DEMO_TODAY,
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
};

function KateringContent() {
  const showToast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [stored, , ready] = useLocalStorage<Catering[]>(STORAGE_KEYS.catering, CATERING_DATA_DEFAULT);
  const catering = Array.isArray(stored) ? stored : CATERING_DATA_DEFAULT;

  const [filters, setFilters] = useState<CateringFilters>(CATERING_FILTERS_DEFAULT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Catering | null>(null);

  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.catering, CATERING_DATA_DEFAULT); }, [ready]);

  const handledQuick = useRef(false);
  useEffect(() => {
    if (handledQuick.current || params.get(QUICK_ACTION_PARAM) !== QUICK_ACTION_NEW) return;
    handledQuick.current = true;
    setEditing(BLANK);
    router.replace(pathname);
  }, [params, pathname, router]);

  const patchFilters = (patch: Partial<CateringFilters>) => setFilters((f) => ({ ...f, ...patch }));

  /** simpen ke localStorage kalo gagal ksh tau admin dan data lama tetap utuh */
  const persist = (next: Catering[]): boolean => {
    if (writeStorage(STORAGE_KEYS.catering, next)) return true;
    showToast("Gagal menyimpan: penyimpanan browser penuh.");
    return false;
  };

  const selected = catering.find((c) => c.id === selectedId) ?? null;

  const handleSave = (payload: CateringPayload) => {
    if (!editing) return;
    if (editing.id) {
      const next = catering.map((c) => (c.id === editing.id ? { ...c, ...payload } : c));
      if (!persist(next)) return;
      showToast(`${editing.id} berhasil diperbarui.`);
    } else {
      const id = nextCateringId(catering);
      const next = [...catering, { ...payload, id, createdAt: "28 Sep 2026 · sekarang" }];
      if (!persist(next)) return;
      showToast(`${id} berhasil dibuat.`);
    }
    setEditing(null);
  };

  const setStatus = (c: Catering, status: Catering["status"], message: string) => {
    const next = catering.map((item) => (item.id === c.id ? { ...item, status } : item));
    if (persist(next)) showToast(message);
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
          <Button id="btn-add-catering" variant="pill" icon="plus" onClick={() => setEditing(BLANK)}>
            Katering Baru
          </Button>
        }
      />

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
            Menampilkan {visible.length} dari {catering.length} pesanan katering
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
