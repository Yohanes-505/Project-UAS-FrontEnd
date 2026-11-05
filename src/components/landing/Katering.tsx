"use client";

import { cx } from "@/lib/format";
import { BROSUR_URL, KATERING_CARDS } from "./content";
import { useLanding } from "./context";

export function Katering() {
  const { openCatering } = useLanding();
  return (
    <section className="katering-section" id="katering" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="katering-header reveal">
        <div>
          <p className="katering-tag">KATERING</p>
          <h2 className="katering-title">
            HIDANGAN MINANG
            <br />
            UNTUK SETIAP ACARA
          </h2>
        </div>
        <div className="katering-info">
          <p className="katering-desc">
            Nasi kotak untuk rapat dan acara kantor, prasmanan untuk pernikahan, arisan, dan syukuran. Kami antar ke area
            Jakarta.
          </p>
          <div className="katering-actions">
            <button type="button" className="btn-solid-red" onClick={openCatering}>
              Pesan Katering
            </button>
            <a className="btn-cream" href={BROSUR_URL} download>
              Unduh Brosur
            </a>
          </div>
        </div>
      </div>

      <div className="katering-grid">
        {KATERING_CARDS.map((c) => (
          <div className={cx("katering-card", "reveal", c.wide && "katering-card-wide")} key={c.label}>
            <img src={`/${c.src}`} alt={c.label} loading="lazy" />
            <span className="katering-pill">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}