"use client";

import type { ReactNode } from "react";
import { PROMO_DATA_DEFAULT } from "@/data/promo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cx, photoUrl } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Promo as PromoType } from "@/types";
import { useLanding } from "./context";

type Slot = {
  card: string;
  text: string;
  badge: string;
  badgeExtra: string;
  circle: string;
  button: string;
};

// Tiga slot desain: kuning & merah di kolom kiri, hijau di kolom kanan.
const SLOTS: Slot[] = [
  { card: "card-yellow", text: "text-black", badge: "badge-red", badgeExtra: "", circle: "circle-small", button: "btn-solid-red" },
  { card: "card-red", text: "text-light", badge: "badge-white", badgeExtra: "", circle: "circle-small", button: "btn-cream" },
  { card: "card-green", text: "text-light", badge: "badge-white", badgeExtra: "badge-top-right", circle: "circle-large", button: "btn-cream" },
];

function PromoCard({ promo, slot }: { promo: PromoType; slot: Slot }) {
  const { openOrder } = useLanding();
  const photo = photoUrl(promo.image);
  return (
    <article className={cx("promo-card", slot.card, "reveal")}>
      <div className={cx("card-badge", slot.badge, slot.badgeExtra)} aria-label={`Nilai promo ${promo.value}`}>
        {promo.value}
      </div>
      <div className={cx("card-content", slot.text)}>
        <h3 className="card-title">{promo.name}</h3>
        <p className="card-desc">{promo.desc}</p>
        <button type="button" className={slot.button} onClick={() => openOrder({ promoId: promo.id })}>
          Pakai Promo
        </button>
      </div>
      <div className={cx("card-circle", slot.circle, photo && "has-photo")} aria-hidden="true">
        {photo ? <img className="card-circle-img" src={photo} alt="" loading="lazy" /> : <span>Foto promo</span>}
      </div>
    </article>
  );
}

export function Promo() {
  const [all] = useLocalStorage(STORAGE_KEYS.promo, PROMO_DATA_DEFAULT);
  const list = all.filter((p) => p.active && p.website).slice(0, 3);
  const left = list.length > 2 ? list.slice(0, 2) : list;
  const right = list.length > 2 ? list[2] : null;

  let body: ReactNode = <p className="kategori-empty text-light">Belum ada promo aktif. Nantikan penawaran berikutnya.</p>;
  if (list.length > 0) {
    body = (
      <div className="promo-grid" style={right ? undefined : { gridTemplateColumns: "1fr" }}>
        <div className="promo-col-left">
          {left.map((p, i) => (
            <PromoCard key={p.id} promo={p} slot={SLOTS[i]} />
          ))}
        </div>
        {right && (
          <div className="promo-col-right">
            <PromoCard promo={right} slot={SLOTS[2]} />
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="promo-section" id="promo" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="promo-header reveal">
        <p className="promo-tag">PROMO</p>
        <h2 className="promo-title text-black">PENAWARAN SPESIAL</h2>
        <p className="promo-subtitle">Hemat lebih banyak untuk hidangan favoritmu.</p>
      </div>
      {body}
    </section>
  );
}