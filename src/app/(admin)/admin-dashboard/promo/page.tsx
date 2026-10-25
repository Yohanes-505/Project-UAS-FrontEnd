"use client";

import { useEffect, useState } from "react";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { PromoEditor } from "@/components/admin/promo/PromoEditor";
import { PromoRow } from "@/components/admin/promo/PromoRow";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { PROMO_DATA_DEFAULT } from "@/data/promo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cx, isoShift, todayISO } from "@/lib/format";
import { nextPromoId, PROMO_FILTERS, promoStatus, type PromoStatus } from "@/lib/promo";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { Promo } from "@/types";

const SUMMARY: Array<{ status: PromoStatus; label: string; icon: IconName; tone: string; delay: number }> = [
  { status: "Aktif", label: "Promo Aktif", icon: "badge-percent", tone: "is-active", delay: 80 },
  { status: "Terjadwal", label: "Terjadwal", icon: "calendar-clock", tone: "is-scheduled", delay: 110 },
  { status: "Nonaktif", label: "Tidak Aktif", icon: "eye-off", tone: "is-off", delay: 140 },
];

export default function PromoPage() {
  const showToast = useToast();
  const [promos] = useLocalStorage<Promo[]>(STORAGE_KEYS.promo, PROMO_DATA_DEFAULT);
  const [filter, setFilter] = useState<"Semua" | PromoStatus>("Semua");
  const [editing, setEditing] = useState<Promo | null>(null);

  // Tanggal hari ini baru diketahui di browser; sebelum itu daftar belum ditampilkan
  // supaya hasil render server dan browser selalu sama.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  /**
   * Simpan ke localStorage. Kalau gagal (biasanya karena penyimpanan browser
   * penuh akibat foto upload), data lama tetap utuh dan admin diberi tahu.
   * Setelah berhasil, useLocalStorage otomatis memperbarui `promos`.
   */
  const persist = (next: Promo[]): boolean => {
    if (writeStorage(STORAGE_KEYS.promo, next)) return true;
    showToast("Gagal menyimpan: penyimpanan browser penuh. Coba pakai foto bawaan atau hapus beberapa foto upload.");
    return false;
  };

  const openNew = () => {
    const start = today ?? todayISO();
    setEditing({
      id: "",
      name: "",
      type: "Diskon Persen",
      value: "",
      start,
      end: isoShift(start, 7),
      active: true,
      website: true,
      desc: "",
    });
  };

  const handleSave = (promo: Promo) => {
    const isNew = !promo.id;
    const next = isNew
      ? [...promos, { ...promo, id: nextPromoId(promos) }]
      : promos.map((p) => (p.id === promo.id ? promo : p));
    if (!persist(next)) return;
    showToast(isNew ? "Promo baru berhasil ditambahkan." : "Promo berhasil diperbarui.");
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!persist(promos.filter((p) => p.id !== id))) return;
    showToast("Promo dihapus.");
    setEditing(null);
  };

  const toggleWebsite = (id: string) => {
    const target = promos.find((p) => p.id === id);
    if (!target) return;
    const next = promos.map((p) => (p.id === id ? { ...p, website: !p.website } : p));
    if (!persist(next)) return;
    showToast(target.website ? "Promo disembunyikan dari website." : "Promo ditampilkan di website.");
  };

  const rows = today
    ? promos.map((promo) => ({ promo, status: promoStatus(promo, today) }))
    : [];
  const visible = rows.filter((row) => filter === "Semua" || row.status === filter);
  const count = (status: PromoStatus) => rows.filter((row) => row.status === status).length;

  return (
    <AdminPage id="page-promo" className="promo-page">
      <PageHeading
        title="Promo Website"
        subtitle="Kelola promo yang ditampilkan pada landing page Lamak Bana."
        actions={
          <Button id="btn-add-promo" variant="pill" icon="plus" onClick={openNew}>
            Tambah Promo
          </Button>
        }
      />

      <div className="promo-summary-grid">
        {SUMMARY.map((item) => (
          <article
            key={item.status}
            className="reveal promo-summary-card"
            style={{ animationDelay: `${item.delay}ms` }}
          >
            <span className={cx("promo-summary-icon", item.tone)}>
              <Icon name={item.icon} />
            </span>
            <div>
              <p className="promo-summary-label">{item.label}</p>
              <p className="promo-summary-value">{count(item.status)}</p>
            </div>
          </article>
        ))}
      </div>

      <section className="reveal promo-list-card" style={{ animationDelay: "180ms" }}>
        <div className="promo-list-head">
          <div>
            <p className="u-text-base fw-semibold u-text-ink">Daftar Promo</p>
            <p className="u-text-xs ink60">
              Promo aktif dapat ditampilkan pada section “Promo Spesial Minggu Ini”.
            </p>
          </div>
          <div id="promo-tabs" className="promo-tabs">
            {PROMO_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={cx("promo-tab", filter === status && "is-active")}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div id="promo-list" className="promo-list">
          {today && visible.length === 0 && (
            <div className="promo-empty">Belum ada promo pada kategori ini.</div>
          )}
          {visible.map(({ promo, status }) => (
            <PromoRow
              key={promo.id}
              promo={promo}
              status={status}
              onEdit={() => setEditing(promo)}
              onToggleWebsite={() => toggleWebsite(promo.id)}
            />
          ))}
        </div>
      </section>

      {editing && (
        <PromoEditor
          key={editing.id || "baru"}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AdminPage>
  );
}
