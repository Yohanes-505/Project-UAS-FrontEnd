"use client";

import { cx, photoUrl } from "@/lib/format";
import { RESERVASI_PHOTOS } from "./content";
import { useLanding } from "./context";
import { useBukaTutup, useRotatingIndex } from "./hooks";

function PhotoLayers({ photos, ms, offset }: { photos: string[]; ms: number; offset: number }) {
  const active = useRotatingIndex(photos.length, ms, offset);
  return (
    <>
      {photos.map((src, i) => (
        <img key={src} className={cx("rsv-layer", i === active && "is-active")} src={photoUrl(src)} alt="" loading="lazy" />
      ))}
    </>
  );
}

export function Reservasi() {
  const { openReservation } = useLanding();
  const status = useBukaTutup();
  return (
    <section className="reservasi-section" id="reservasi" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="reservasi-content reveal">
        <div className="reservasi-tag-row">
          <p className="reservasi-tag">RESERVASI</p>
          {status && (
            <span className={cx("status-badge", status.open ? "open" : "closed")} role="status">
              {status.text}
            </span>
          )}
        </div>
        <h2 className="reservasi-title">
          <span className="reservasi-title-big">LAPAR?</span>
          <br />
          AMANKAN MEJAMU SEKARANG
        </h2>
        <p className="reservasi-desc">Datang bersama keluarga atau teman tanpa antre. Pilih jam dan area, kami siapkan mejanya.</p>
        <div className="reservasi-actions">
          <button type="button" className="btn-solid-red" onClick={openReservation}>
            Reservasi Meja
          </button>
          <a className="btn-cream" href="#menu">
            Lihat Menu
          </a>
        </div>
      </div>

      <div className="reservasi-circle" aria-hidden="true">
        <PhotoLayers photos={RESERVASI_PHOTOS} ms={5500} offset={0} />
      </div>
      <div className="reservasi-circle-small" aria-hidden="true" />

      <svg className="reservasi-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 70C240 130 480 10 720 55C960 100 1200 20 1440 70V120H0Z" />
      </svg>
    </section>
  );
}