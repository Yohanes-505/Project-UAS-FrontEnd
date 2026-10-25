"use client";

import { useSettings } from "@/hooks/useSettings";
import { jamTitik } from "./lib";
import { useLanding } from "./context";

export function Tentang() {
  const [s] = useSettings();
  const { openReservation } = useLanding();
  return (
    <section className="tentang-section" id="tentang" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="tentang-container">
        <div className="tentang-photo reveal">
          <div className="tentang-arch">
            <img src="/images/tentangkami/tentangkami.jpg" alt="Suasana dapur dan hidangan Lamak Bana" loading="lazy" />
          </div>
          <div className="card-badge badge-red tentang-badge tentang-badge-1" aria-hidden="true">
            Sejak 1998
          </div>
          <div className="card-badge badge-white tentang-badge tentang-badge-2" aria-hidden="true">
            Resep Keluarga
          </div>
        </div>

        <div className="tentang-text reveal">
          <p className="tentang-tag">TENTANG KAMI</p>
          <h2 className="tentang-title">KISAH DI BALIK RASA</h2>
          <p>
            Lamak Bana memasak masakan Minang dengan resep turun-temurun sejak 1998. Santan, cabai, dan rempah diolah
            perlahan supaya rasanya sama seperti di dapur keluarga.
          </p>
          <blockquote className="tentang-quote">“Lamak bana” dalam bahasa Minang berarti “enak sekali”.</blockquote>
          <div className="tentang-jam">
            <div className="jam-list">
              <p className="jam-title">Jam Buka</p>
              <p>
                Senin – Jumat: {jamTitik(s.weekdayOpen)} – {jamTitik(s.weekdayClose)} WIB
              </p>
              <p>
                Sabtu – Minggu: {jamTitik(s.weekendOpen)} – {jamTitik(s.weekendClose)} WIB
              </p>
            </div>
            <button type="button" className="btn-solid-red" onClick={openReservation}>
              Reservasi Meja
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}