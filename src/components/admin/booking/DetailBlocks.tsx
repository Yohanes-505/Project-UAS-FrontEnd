import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

/** kotak catatan */
export function NoteBox({ note }: { note: string }) {
  return (
    <div>
      <p className="detail-label">CATATAN</p>
      <div className="reservation-note-box">{note || "Tidak ada catatan."}</div>
    </div>
  );
}

/** tombol edit detail */
export function EditLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="reservation-edit-link" onClick={onClick}>
      <Icon name="pencil" className="u-size-4" /> {children}
    </button>
  );
}

/** kotak petunjuk kecil */
export function FormHint({ children }: { children: ReactNode }) {
  return (
    <div className="reservation-form-hint">
      <Icon name="info" className="u-size-4" />
      <span>{children}</span>
    </div>
  );
}

/** kotak info */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <div className="reservation-source-note">
      <Icon name="globe-2" className="u-size-4" />
      <span>{children}</span>
    </div>
  );
}

export function WebsiteSyncPill() {
  return (
    <span className="website-sync-pill">
      <span className="website-sync-dot" />
      Terhubung ke Website
    </span>
  );
}
