"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { BookingEmpty, BookingTabs, BookingToolbar, WebsiteSyncPill } from "@/components/admin/booking";
import {
  ReservationAgenda,
  ReservationDetail,
  ReservationEditor,
  ReservationHours,
  ReservationRow,
  ReservationStats,
  type ReservationPayload,
} from "@/components/admin/reservation";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { useToast } from "@/components/ui/Toast";
import { DROPDOWN_OPTIONS, RESERVATION_DATA_DEFAULT } from "@/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSettings } from "@/hooks/useSettings";
import { QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";
import { DEMO_TODAY } from "@/lib/booking";
import {
  filterReservations,
  nextReservationId,
  RESERVATION_FILTERS_DEFAULT,
  RESERVATION_NEXT,
  RESERVATION_TABS,
  reservationsBase,
  type ReservationFilters,
} from "@/lib/reservations";
import { seedStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { Reservation } from "@/types";

/** reservasi kosong untuk form reservasi baru*/
const BLANK: Reservation = {
  id: "",
  customer: "",
  phone: "",
  date: DEMO_TODAY,
  time: "12:00",
  pax: 2,
  table: "",
  area: "Ruang Utama",
  source: "Admin",
  status: "Menunggu",
  occasion: "",
  note: "",
  createdAt: "",
};

function ReservasiContent() {
  const showToast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [settings] = useSettings();

  const [stored, , ready] = useLocalStorage<Reservation[]>(STORAGE_KEYS.reservations, RESERVATION_DATA_DEFAULT);
  const reservations = Array.isArray(stored) ? stored : RESERVATION_DATA_DEFAULT;

  const [filters, setFilters] = useState<ReservationFilters>(RESERVATION_FILTERS_DEFAULT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Reservation | null>(null);

  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.reservations, RESERVATION_DATA_DEFAULT); }, [ready]);

  const handledQuick = useRef(false);
  useEffect(() => {
    if (handledQuick.current || params.get(QUICK_ACTION_PARAM) !== QUICK_ACTION_NEW) return;
    handledQuick.current = true;
    setEditing(BLANK);
    router.replace(pathname);
  }, [params, pathname, router]);

  const patchFilters = (patch: Partial<ReservationFilters>) => setFilters((f) => ({ ...f, ...patch }));

  /** simpen ke localStorage kalo gagal ksh tau admin dan data lama tetap utuh */
  const persist = (next: Reservation[]): boolean => {
    if (writeStorage(STORAGE_KEYS.reservations, next)) return true;
    showToast("Gagal menyimpan: penyimpanan browser penuh.");
    return false;
  };

  const selected = reservations.find((r) => r.id === selectedId) ?? null;

  const handleSave = (payload: ReservationPayload) => {
    if (!editing) return;
    if (editing.id) {
      const next = reservations.map((r) => (r.id === editing.id ? { ...r, ...payload } : r));
      if (!persist(next)) return;
      showToast(`${editing.id} berhasil diperbarui.`);
    } else {
      const id = nextReservationId(reservations);
      const next = [...reservations, { ...payload, id, createdAt: "28 Sep 2026 · sekarang" }];
      if (!persist(next)) return;
      showToast(`${id} berhasil dibuat.`);
    }
    setEditing(null);
  };

  const setStatus = (r: Reservation, status: Reservation["status"], message: string) => {
    const next = reservations.map((item) => (item.id === r.id ? { ...item, status } : item));
    if (persist(next)) showToast(message);
  };

  const advance = (r: Reservation) => {
    const status = RESERVATION_NEXT[r.status];
    if (status) setStatus(r, status, `${r.id} diperbarui menjadi ${status}.`);
  };
  const cancel = (r: Reservation) => setStatus(r, "Dibatalkan", `${r.id} dibatalkan.`);

  const base = reservationsBase(reservations, filters);
  const counts: Record<string, number> = { Semua: base.length };
  for (const r of base) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const visible = filterReservations(reservations, filters);

  return (
    <AdminPage id="page-reservasi">
      <PageHeading
        title="Kelola Reservasi"
        badge={<WebsiteSyncPill />}
        subtitle="Pantau booking meja, konfirmasi kedatangan, dan catat reservasi dari website maupun admin."
        actions={
          <Button id="btn-add-reservation" variant="pill" icon="calendar-plus" onClick={() => setEditing(BLANK)}>
            Reservasi Baru
          </Button>
        }
      />

      <ReservationStats
        reservations={reservations}
        onPickStatus={(status) => patchFilters({ status, date: "Hari ini" })}
      />

      <div className="reservation-overview-grid">
        <ReservationAgenda reservations={reservations} onOpen={setSelectedId} />
        <ReservationHours settings={settings} />
      </div>

      <section className="reveal reservation-manager-shell" style={{ animationDelay: "260ms" }}>
        <BookingToolbar
          prefix="reservation"
          placeholder="Cari nama, ID, atau nomor telepon..."
          search={filters.search}
          onSearch={(search) => patchFilters({ search })}
          onReset={() => setFilters(RESERVATION_FILTERS_DEFAULT)}
        >
          <FilterDropdown id="reservation-source" value={filters.source} options={DROPDOWN_OPTIONS["reservation-source"]}
            onChange={(source) => patchFilters({ source })} align="right"
            className="reservation-filter-dropdown" ariaLabel="Filter sumber" />
          <FilterDropdown id="reservation-date" value={filters.date} options={DROPDOWN_OPTIONS["reservation-date"]}
            onChange={(date) => patchFilters({ date })} align="right"
            className="reservation-filter-dropdown" ariaLabel="Filter tanggal" />
        </BookingToolbar>

        <BookingTabs prefix="reservation" statuses={RESERVATION_TABS} active={filters.status}
          counts={counts} onChange={(status) => patchFilters({ status })} />

        <div className="w-100 overflow-auto">
          <div className="reservation-table">
            <div className="reservation-table-head">
              <span>ID</span><span>PELANGGAN</span><span>JADWAL</span><span>PAX</span>
              <span>MEJA / AREA</span><span>SUMBER</span><span>STATUS</span><span></span>
            </div>
            <div id="reservation-rows">
              {visible.length === 0 && <BookingEmpty icon="calendar-x" title="Reservasi tidak ditemukan" />}
              {visible.map((r) => (
                <ReservationRow key={r.id} reservation={r} onOpen={() => setSelectedId(r.id)} />
              ))}
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between u-gap-3 u-pt-1">
          <p id="reservation-count" className="u-text-xs ink60">
            Menampilkan {visible.length} dari {reservations.length} reservasi
          </p>
          <span className="table-footer-note">Gunakan filter untuk mempersempit data</span>
        </div>
      </section>

      {selected && !editing && (
        <ReservationDetail
          reservation={selected}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setEditing(selected); setSelectedId(null); }}
          onAdvance={() => advance(selected)}
          onCancel={() => cancel(selected)}
        />
      )}
      {editing && (
        <ReservationEditor
          key={editing.id || "baru"}
          initial={editing}
          settings={settings}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </AdminPage>
  );
}

export default function ReservasiPage() {
  return (
    <Suspense fallback={null}>
      <ReservasiContent />
    </Suspense>
  );
}
