import type { KeyboardEvent } from "react";
import { StatusPill } from "@/components/admin/booking";
import { Icon } from "@/components/ui/Icon";
import { STATUS_STYLE } from "@/data/status-styles";
import type { Order } from "@/types";

export function OrderRow({ order: o, onOpen }: { order: Order; onOpen: () => void }) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <div className="order-full-row" tabIndex={0} role="button" onClick={onOpen} onKeyDown={onKeyDown}>
      <p className="u-text-sm fw-medium u-text-ink">{o.id}</p>
      <div>
        <p className="u-text-sm u-text-ink">{o.customer}</p>
        <p className="u-text-xs ink40">{o.phone}</p>
      </div>
      <p className="u-text-sm u-text-ink text-truncate">{o.summary}</p>
      <p className="u-text-sm ink60">{o.channel}</p>
      <p className="u-text-sm ink60">{o.time}</p>
      <p className="u-text-sm fw-medium u-text-ink text-end">{o.total}</p>
      <div><StatusPill status={o.status} styles={STATUS_STYLE} /></div>
      <button type="button" className="order-row-menu" aria-label={`Buka detail ${o.id}`}>
        <Icon name="more-horizontal" className="u-size-4" />
      </button>
    </div>
  );
}
