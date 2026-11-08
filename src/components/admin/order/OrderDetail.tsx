import { NoteBox, StatusPill } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { STATUS_STYLE } from "@/data/status-styles";
import { rupiah } from "@/lib/format";
import { ORDER_NEXT, ORDER_STEPS, orderLineTotal, orderStepIndex } from "@/lib/orders";
import { cx } from "@/lib/format";
import type { Order } from "@/types";

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onAdvance: () => void;
  onCancel: () => void;
}

export function OrderDetail({ order: o, onClose, onAdvance, onCancel }: OrderDetailProps) {
  const next = ORDER_NEXT[o.status];
  const current = orderStepIndex(o.status);
  const cancelled = o.status === "Dibatalkan";

  const footer = next ? (
    <>
      <Button variant="secondary" onClick={onCancel}>Batalkan</Button>
      <Button icon="check" onClick={onAdvance}>{next.label}</Button>
    </>
  ) : (
    <Button onClick={onClose}>Tutup Detail</Button>
  );

  return (
    <Drawer open onClose={onClose} eyebrow="DETAIL PESANAN" title={o.id} closeLabel="Tutup detail" footer={footer}>
      <div className="d-flex flex-column u-gap-4">
        <div className="d-flex align-items-start justify-content-between u-gap-3">
          <div>
            <p className="u-text-base fw-semibold u-text-ink">{o.customer}</p>
            <p className="u-text-sm ink60">{o.phone}</p>
          </div>
          <StatusPill status={o.status} styles={STATUS_STYLE} />
        </div>

        <div className="detail-card d-flex flex-column u-gap-3">
          <div className="d-flex justify-content-between u-gap-3">
            <div><p className="detail-label">KANAL</p><p className="detail-value">{o.channel}</p></div>
            <div className="text-end"><p className="detail-label">WAKTU</p><p className="detail-value">{o.date} · {o.time}</p></div>
          </div>
          <div><p className="detail-label">INFO</p><p className="detail-value">{o.channelInfo}</p></div>
        </div>

        <div>
          <p className="detail-label">RINCIAN PESANAN</p>
          <div className="mt-2">
            {o.items.map((it, i) => (
              <div className="detail-item" key={`${it[0]}-${i}`}>
                <div>
                  <p className="u-text-sm fw-medium u-text-ink">{it[0]}</p>
                  <p className="u-text-xs ink60">{it[1]} × {it[2]}</p>
                </div>
                <p className="u-text-sm fw-medium u-text-ink">{rupiah(orderLineTotal(it))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card d-flex flex-column u-gap-2">
          <div className="detail-total-row"><span className="ink60">Subtotal</span><span>{o.subtotal}</span></div>
          <div className="detail-total-row"><span className="ink60">Diskon</span><span>{o.discount}</span></div>
          <div className="u-h-px divider my-1" />
          <div className="detail-total-row fw-semibold"><span>Total</span><span className="u-text-maroon">{o.total}</span></div>
        </div>

        <div className="detail-card d-flex flex-column u-gap-2">
          <div className="d-flex justify-content-between">
            <div><p className="detail-label">PEMBAYARAN</p><p className="detail-value">{o.payment}</p></div>
            <div className="text-end"><p className="detail-label">STATUS</p><p className="detail-value fw-medium u-text-leaf">{o.paymentStatus}</p></div>
          </div>
        </div>

        <NoteBox note={o.note} />

        <div>
          <p className="detail-label">STATUS PESANAN</p>
          <div className="detail-timeline">
            {cancelled
              ? o.timeline.map(([time, label], i) => (
                  <div key={i} className={cx("timeline-row", i < o.timeline.length - 1 ? "done" : "current")}>
                    <span className="timeline-dot" />
                    <div><p className="u-text-sm fw-medium u-text-ink">{label}</p><p className="u-text-xs ink60">{time}</p></div>
                  </div>
                ))
              : ORDER_STEPS.map((label, i) => {
                  const reached = i <= current;
                  return (
                    <div key={label} className={cx("timeline-row", i < current ? "done" : i === current && "current")}>
                      <span className="timeline-dot" />
                      <div>
                        <p className={cx("u-text-sm", reached ? "fw-medium u-text-ink" : "ink40")}>{label}</p>
                        <p className={cx("u-text-xs", reached ? "ink60" : "ink40")}>{o.timeline[i]?.[0] ?? "—"}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
