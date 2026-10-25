import type { KeyboardEvent } from "react";
import { StatusPill } from "@/components/admin/booking";
import { Icon } from "@/components/ui/Icon";
import { RESERVATION_STATUS_STYLE } from "@/data/status-styles";
import { formatBookingDate } from "@/lib/booking";
import { SOURCE_ICON } from "@/lib/reservations";
import type { Reservation } from "@/types";

/** Satu baris di tabel reservasi*/
export function ReservationRow({ reservation: r, onOpen }: { reservation: Reservation; onOpen: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div className="reservation-row" tabIndex={0} role="button" onClick={onOpen} onKeyDown={onKeyDown}>
      <p className="u-text-sm fw-medium u-text-ink">{r.id}</p>
      <div>
        <p className="u-text-sm u-text-ink">{r.customer}</p>
        <p className="u-text-xs ink40">{r.phone}</p>
      </div>
      <div>
        <p className="u-text-sm u-text-ink">{formatBookingDate(r.date, true)} · {r.time}</p>
        <p className="u-text-xs ink40">{r.occasion || "Reservasi meja"}</p>
      </div>
      <p className="u-text-sm u-text-ink">{r.pax} pax</p>
      <div>
        <p className="u-text-sm u-text-ink">{r.table || "Belum ditentukan"}</p>
        <p className="u-text-xs ink40">{r.area}</p>
      </div>
      <span className="reservation-source-badge">
        <Icon name={SOURCE_ICON[r.source] ?? "user-round-cog"} className="u-size-3" />
        {r.source}
      </span>
      <div>
        <StatusPill status={r.status} styles={RESERVATION_STATUS_STYLE} />
      </div>
      <button type="button" className="order-row-menu" aria-label={`Buka detail ${r.id}`}>
        <Icon name="more-horizontal" className="u-size-4" />
      </button>
    </div>
  );
}
