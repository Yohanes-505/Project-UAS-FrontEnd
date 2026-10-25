import type { KeyboardEvent } from "react";
import { StatusPill } from "@/components/admin/booking";
import { Icon } from "@/components/ui/Icon";
import { CATERING_STATUS_STYLE } from "@/data/status-styles";
import { formatBookingDate } from "@/lib/booking";
import { cateringPayment, cateringRupiah } from "@/lib/catering";
import type { Catering } from "@/types";

/** satu baris di tabel katering */
export function CateringRow({ catering: c, onOpen }: { catering: Catering; onOpen: () => void }) {
  const { balance } = cateringPayment(c);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div className="catering-row" tabIndex={0} role="button" onClick={onOpen} onKeyDown={onKeyDown}>
      <p className="u-text-sm fw-medium u-text-ink">{c.id}</p>
      <div>
        <p className="u-text-sm u-text-ink">{c.customer}</p>
        <p className="u-text-xs ink40">PIC: {c.pic}</p>
      </div>
      <div>
        <p className="u-text-sm u-text-ink">{c.event}</p>
        <p className="u-text-xs ink40">{c.package}</p>
      </div>
      <div>
        <p className="u-text-sm u-text-ink">{formatBookingDate(c.date, true)} · {c.time}</p>
        <p className="u-text-xs ink40">{c.address}</p>
      </div>
      <p className="u-text-sm u-text-ink">{c.pax} pax</p>
      <span className="catering-service-badge">
        <Icon name={c.service === "Prasmanan" ? "concierge-bell" : "package"} className="u-size-3" />
        {c.service}
      </span>
      <div>
        <p className="u-text-sm fw-medium u-text-ink">{cateringRupiah(c.total)}</p>
        <p className={balance ? "u-text-xs u-text-maroon" : "u-text-xs u-text-leaf"}>
          {balance ? `Sisa ${cateringRupiah(balance)}` : "Lunas"}
        </p>
      </div>
      <div>
        <StatusPill status={c.status} styles={CATERING_STATUS_STYLE} />
      </div>
      <button type="button" className="order-row-menu" aria-label={`Buka detail ${c.id}`}>
        <Icon name="more-horizontal" className="u-size-4" />
      </button>
    </div>
  );
}
