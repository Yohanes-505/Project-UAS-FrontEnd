import { StatusPill } from "@/components/admin/booking";
import { CATERING_STATUS_STYLE } from "@/data/status-styles";
import { formatBookingDate } from "@/lib/booking";
import { upcomingCatering } from "@/lib/catering";
import type { Catering } from "@/types";

const MAX_ITEMS = 5;

/** jadwal Katering terdekat */
export function CateringAgenda({ catering, onOpen }: { catering: Catering[]; onOpen: (id: string) => void }) {
  const upcoming = upcomingCatering(catering);

  return (
    <section className="reveal catering-agenda-card" style={{ animationDelay: "200ms" }}>
      <div className="d-flex align-items-center justify-content-between u-gap-3">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Jadwal Katering Terdekat</p>
          <p className="u-text-xs ink60">Produksi dan pengiriman yang perlu dipantau</p>
        </div>
        <span id="catering-agenda-count" className="catering-agenda-pill">{upcoming.length} agenda</span>
      </div>
      <div id="catering-agenda" className="catering-agenda-list">
        {upcoming.length === 0 && (
          <div className="reservation-empty-small">Belum ada agenda katering mendatang.</div>
        )}
        {upcoming.slice(0, MAX_ITEMS).map((c) => (
          <button key={c.id} type="button" className="catering-agenda-item" onClick={() => onOpen(c.id)}>
            <span className="catering-agenda-date">
              <strong>{formatBookingDate(c.date, true)}</strong>
              <small>{c.time}</small>
            </span>
            <span className="catering-agenda-line"><i /></span>
            <span className="catering-agenda-copy">
              <strong>{c.customer}</strong>
              <small>{c.service} · {c.pax} pax · {c.event}</small>
            </span>
            <StatusPill status={c.status} styles={CATERING_STATUS_STYLE} />
          </button>
        ))}
      </div>
    </section>
  );
}
