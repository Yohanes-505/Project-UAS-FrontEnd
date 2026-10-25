"use client";

import { useMemo, useState } from "react";
import { MENU_DATA_DEFAULT, menuImage } from "@/data/menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cx, photoUrl, rupiah } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import type { MenuItem } from "@/types";
import { useLanding } from "./context";

const CORE_COUNT = 3;

function MenuCard({ item, extra }: { item: MenuItem; extra: boolean }) {
  const { openOrder } = useLanding();
  const photo = photoUrl(menuImage(item));
  const soldOut = !item.available || item.stock <= 0;
  return (
    <article className={cx("menu-card", "reveal", extra && "menu-card-extra")}>
      <div className={cx("card-img-wrapper", photo && "has-photo")}>
        {photo ? (
          <img className="menu-card-img" src={photo} alt={item.name} loading="lazy" />
        ) : (
          <span className="foto-placeholder">Foto menu</span>
        )}
        {soldOut ? <span className="badge-terlaris">Habis</span> : item.featured && <span className="badge-terlaris">Terlaris</span>}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3 className="menu-card-title">{item.name}</h3>
          <span className="menu-card-price">{rupiah(item.price)}</span>
        </div>
        <p className="menu-card-desc">{item.desc}</p>
        <button
          type="button"
          className={cx("btn-solid-red", soldOut && "is-disabled")}
          disabled={soldOut}
          onClick={() => openOrder({ menuId: item.id })}
        >
          {soldOut ? "Stok Habis" : "Pesan"}
        </button>
      </div>
    </article>
  );
}

/** Menu dibaca dari localStorage yang sama dengan admin (hanya yang diberi tanda "tampil di website"). */
export function MenuSection() {
  const [all] = useLocalStorage(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
  const [showAll, setShowAll] = useState(false);

  // andalan (featured) lebih dulu, 3 pertama langsung tampil, sisanya menunggu "Lihat Semua Menu"
  const items = useMemo(() => {
    const visible = all.filter((m) => m.website);
    return [...visible.filter((m) => m.featured), ...visible.filter((m) => !m.featured)];
  }, [all]);
  const hasExtra = items.length > CORE_COUNT;

  return (
    <section className="menu-section" id="menu" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="menu-header-container reveal">
        <div className="menu-header-text">
          <p className="menu-tag">MENU</p>
          <h2 className="menu-title">MENU ANDALAN KAMI</h2>
          <p className="menu-subtitle">Resep yang sama sejak 1998, dimasak dengan sabar.</p>
        </div>
        <button
          type="button"
          id="menuToggleAll"
          className="btn-cream"
          hidden={!hasExtra}
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Menu"}
        </button>
      </div>

      <div className={cx("menu-grid", showAll && "show-all")}>
        {items.map((m, i) => (
          <MenuCard key={m.id} item={m} extra={i >= CORE_COUNT} />
        ))}
        <div className="menu-card-soon" aria-label="Menu baru segera hadir">
          <span className="soon-icon" aria-hidden="true">
            🍲
          </span>
          <span className="soon-pill">Segera Hadir</span>
          <h3 className="soon-title">Menu Baru</h3>
          <p className="soon-desc">Masakan Minang lain sedang kami siapkan untukmu.</p>
        </div>
      </div>
    </section>
  );
}