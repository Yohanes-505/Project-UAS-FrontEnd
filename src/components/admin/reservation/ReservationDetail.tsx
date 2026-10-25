import { EditLink, NoteBox, StatusPill } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { RESERVATION_STATUS_STYLE } from "@/data/status-styles";
import { formatBookingDate } from "@/lib/booking";
import type { Reservation } from "@/types";

interface ReservationDetailProps {
  reservation: Reservation;
  onClose: () => void;
  onEdit: () => void;
  onAdvance: () => void;
  onCancel: () => void;
}

/** detail satu reservasi + tombol aksi sesuai status. */
export function ReservationDetail({ reservation: r, onClose, onEdit, onAdvance, onCancel }: ReservationDetailProps) {
  let footer;
  if (r.status === "Menunggu") {
    footer = (
      <>
        <Button variant="secondary" onClick={onCancel}>Batalkan</Button>
        <Button icon="check" onClick={onAdvance}>Konfirmasi</Button>
      </>
    );
  } else if (r.status === "Dikonfirmasi") {
    footer = (
      <>
        <Button variant="secondary" onClick={onCancel}>Batalkan</Button>
        <Button icon="log-in" onClick={onAdvance}>Tandai Hadir</Button>
      </>
    );
  } else if (r.status === "Hadir") {
    footer = (
      <>
        <Button variant="secondary" onClick={onEdit}>Edit</Button>
        <Button icon="check-circle-2" onClick={onAdvance}>Selesaikan</Button>
      </>
    );
  } else {
    footer = <Button onClick={onClose}>Tutup</Button>;
  }

  return (
    <Drawer open onClose={onClose} eyebrow="DETAIL RESERVASI" title={r.id} closeLabel="Tutup detail" footer={footer}>
      <div className="d-flex flex-column u-gap-4">
        <div className="d-flex align-items-start justify-content-between u-gap-3">
          <div>
            <p className="u-text-base fw-semibold u-text-ink">{r.customer}</p>
            <p className="u-text-sm ink60">{r.phone}</p>
          </div>
          <StatusPill status={r.status} styles={RESERVATION_STATUS_STYLE} />
        </div>

        <div className="reservation-detail-grid">
          <div><span>JADWAL</span><strong>{formatBookingDate(r.date)} · {r.time}</strong></div>
          <div><span>JUMLAH TAMU</span><strong>{r.pax} pax</strong></div>
          <div><span>MEJA</span><strong>{r.table || "Belum ditentukan"}</strong></div>
          <div><span>AREA</span><strong>{r.area}</strong></div>
        </div>

        <div className="detail-card d-flex flex-column u-gap-3">
          <div className="d-flex justify-content-between u-gap-3">
            <div>
              <p className="detail-label">SUMBER</p>
              <p className="detail-value">{r.source}</p>
            </div>
            <div className="text-end">
              <p className="detail-label">DIBUAT</p>
              <p className="detail-value">{r.createdAt}</p>
            </div>
          </div>
          <div>
            <p className="detail-label">ACARA / KEPERLUAN</p>
            <p className="detail-value">{r.occasion || "—"}</p>
          </div>
        </div>

        <NoteBox note={r.note} />
        <EditLink onClick={onEdit}>Edit detail reservasi</EditLink>
      </div>
    </Drawer>
  );
}
