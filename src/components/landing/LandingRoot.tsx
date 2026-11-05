"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BackToTop } from "./BackToTop";
import { CateringModal } from "./CateringModal";
import { LandingProvider, type LandingActions, type OrderOptions } from "./context";
import { Footer } from "./Footer";
import { useModalLock, useScrollReveal } from "./hooks";
import { KategoriModal } from "./KategoriModal";
import { Navbar } from "./Navbar";
import { OrderModal } from "./OrderModal";
import { ReservationModal } from "./ReservationModal";

/**
 * Pembungkus landing page: navbar, footer, tombol kembali ke atas, dan semua modal.
 * Section ditaruh sebagai `children` di dalam <main>.
 */
export default function LandingRoot({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [js, setJs] = useState(false);
  const [order, setOrder] = useState<OrderOptions | null>(null);
  const [catering, setCatering] = useState(false);
  const [reservation, setReservation] = useState(false);
  const [kategoriId, setKategoriId] = useState<string | null>(null);

  // class `js` baru dipasang setelah React aktif, jadi tanpa JS konten tetap terlihat
  useEffect(() => setJs(true), []);
  useScrollReveal(rootRef);
  useModalLock(order !== null || catering || reservation || kategoriId !== null);

  const actions = useMemo<LandingActions>(
    () => ({
      openOrder: (options = {}) => setOrder(options),
      openCatering: () => setCatering(true),
      openReservation: () => setReservation(true),
      openKategori: (id) => setKategoriId(id),
      activeKategori: kategoriId,
    }),
    [kategoriId],
  );

  return (
    <LandingProvider value={actions}>
      <div ref={rootRef} className={js ? "js" : undefined}>
        <a className="skip-link" href="#konten-utama">
          Lewati ke konten
        </a>
        <Navbar />
        <main id="konten-utama">
          {children}
        </main>
        <Footer />
        <BackToTop />

        <OrderModal options={order} onClose={() => setOrder(null)} />
        <CateringModal open={catering} onClose={() => setCatering(false)} />
        <ReservationModal open={reservation} onClose={() => setReservation(false)} />
        <KategoriModal id={kategoriId} onClose={() => setKategoriId(null)} />
      </div>
    </LandingProvider>
  );
}