import { EditLink, NoteBox, StatusPill } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { CATERING_STATUS_STYLE } from "@/data/status-styles";
import { formatBookingDate } from "@/lib/booking";
import { CATERING_NEXT, cateringPayment, cateringRupiah } from "@/lib/catering";
import type { Catering } from "@/types";

interface CateringDetailProps {
  catering: Catering;
  onClose: () => void;
  onEdit: () => void;
  onAdvance: () => void;
  onCancel: () => void;
}

/** detail satu pesanan katering, kartu pembayaran, tombol */
export function CateringDetail({ catering: c, onClose, onEdit, onAdvance, onCancel }: CateringDetailProps) {
  const { balance, percent } = cateringPayment(c);
  const next = CATERING_NEXT[c.status];

  const footer = next ? (
    <>
      <Button variant="secondary" onClick={onCancel}>Batalkan</Button>
      <Button icon="arrow-right" onClick={onAdvance}>{next.label}</Button>
    </>
  ) : (
    <Button onClick={onClose}>Tutup</Button>
  );

  return (
    <Drawer open onClose={onClose} eyebrow="DETAIL KATERING" title={c.id} closeLabel="Tutup detail" footer={footer}>
      <div className="d-flex flex-column u-gap-4">
        <div className="d-flex align-items-start justify-content-between u-gap-3">
          <div>
            <p className="u-text-base fw-semibold u-text-ink">{c.customer}</p>
            <p className="u-text-sm ink60">PIC {c.pic} · {c.phone}</p>
          </div>
          <StatusPill status={c.status} styles={CATERING_STATUS_STYLE} />
        </div>

        <div className="reservation-detail-grid">
          <div><span>JADWAL</span><strong>{formatBookingDate(c.date)} · {c.time}</strong></div>
          <div><span>JUMLAH</span><strong>{c.pax} pax</strong></div>
          <div><span>ACARA</span><strong>{c.event}</strong></div>
          <div><span>LAYANAN</span><strong>{c.service}</strong></div>
        </div>

        <div className="detail-card d-flex flex-column u-gap-3">
          <div>
            <p className="detail-label">PAKET / MENU</p>
            <p className="detail-value">{c.package}</p>
          </div>
          <div>
            <p className="detail-label">LOKASI</p>
            <p className="detail-value">{c.address || "—"}</p>
          </div>
          <div className="d-flex justify-content-between u-gap-3">
            <div>
              <p className="detail-label">SUMBER</p>
              <p className="detail-value">{c.source}</p>
            </div>
            <div className="text-end">
              <p className="detail-label">DIBUAT</p>
              <p className="detail-value">{c.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="catering-payment-card">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <p className="detail-label">PEMBAYARAN</p>
              <p className="catering-payment-total">{cateringRupiah(c.total)}</p>
            </div>
            <span>{percent}%</span>
          </div>
          <div className="catering-progress"><i style={{ width: `${percent}%` }} /></div>
          <div className="catering-payment-meta">
            <span>DP {cateringRupiah(c.dp)}</span>
            <strong>{balance ? `Sisa ${cateringRupiah(balance)}` : "LUNAS"}</strong>
          </div>
        </div>

        <NoteBox note={c.note} />
        <EditLink onClick={onEdit}>Edit detail katering</EditLink>
      </div>
    </Drawer>
  );
}
