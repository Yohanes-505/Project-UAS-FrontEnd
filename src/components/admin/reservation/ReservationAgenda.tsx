import { StatusPill } from "@/components/admin/booking";
import { RESERVATION_STATUS_STYLE } from "@/data/status-styles";
import { DEMO_TODAY, formatLongDate } from "@/lib/booking";
import { todaysReservations } from "@/lib/reservations";
import type { Reservation } from "@/types";

const MAX_ITEMS = 7;

/** agenda Hari Ini */
export function ReservationAgenda({
  reservations,
  onOpen,
}: {
  reservations: Reservation[];
  onOpen: (id: string) => void;
}) {
  const today = todaysReservations(reservations).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="reveal reservation-agenda-card" style={{ animationDelay: "200ms" }}>
      <div className="d-flex align-items-center justify-content-between u-gap-3">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Agenda Hari Ini</p>
          <p className="u-text-xs ink60">{formatLongDate(DEMO_TODAY)}</p>
        </div>
        <span id="reservation-agenda-count" className="reservation-agenda-pill">
          {today.length} booking
        </span>
      </div>
      <div id="reservation-agenda" className="reservation-agenda-list">
        {today.length === 0 && (
          <div className="reservation-empty-small">Belum ada reservasi untuk hari ini.</div>
        )}
        {today.slice(0, MAX_ITEMS).map((r) => (
          <button key={r.id} type="button" className="reservation-agenda-item" onClick={() => onOpen(r.id)}>
            <span className="reservation-agenda-time">{r.time}</span>
            <span className="reservation-agenda-line"><i /></span>
            <span className="reservation-agenda-copy">
              <strong>{r.customer}</strong>
              <small>{r.pax} pax · {r.table || r.area}</small>
            </span>
            <StatusPill status={r.status} styles={RESERVATION_STATUS_STYLE} />
          </button>
        ))}
      </div>
    </section>
  );
}
