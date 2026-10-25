"use client";

import type { ReactNode } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cx } from "@/lib/format";
import { CloseButton } from "./Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Teks kecil di atas judul, mis. "DETAIL PESANAN". */
  eyebrow?: string;
  title: ReactNode;
  /** Class panel dari file asli: "order-detail-panel", "menu-editor-panel", dst. */
  panelClassName?: string;
  /** Tombol-tombol di bagian bawah (Simpan, Batal, ...). */
  footer?: ReactNode;
  /** Class tambahan untuk area isi. Default: "order-detail-body". */
  bodyClassName?: string;
  closeLabel?: string;
  children: ReactNode;
}

/**
 * Panel geser dari kanan. Dipakai untuk detail pesanan, editor menu,
 * reservasi, katering, dan promo. Isi panel dikirim lewat `children`.
 *
 *   <Drawer open={!!selected} onClose={() => setSelected(null)}
 *           eyebrow="DETAIL PESANAN" title={selected?.id}
 *           footer={<Button>Proses</Button>}>
 *     ...isi detail...
 *   </Drawer>
 */
export function Drawer({
  open,
  onClose,
  eyebrow,
  title,
  panelClassName = "order-detail-panel",
  footer,
  bodyClassName = "order-detail-body",
  closeLabel = "Tutup",
  children,
}: DrawerProps) {
  useEscapeKey(onClose, open);
  if (!open) return null;

  return (
    <div
      className="position-fixed u-inset-0 u-z-60 d-flex justify-content-end"
      style={{ background: "rgba(0,0,0,.28)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className={cx(panelClassName, "anim-slide bg-white")} role="dialog" aria-modal="true">
        <div className="order-drawer-head">
          <div>
            {eyebrow && <p className="u-text-xs fw-medium u-tracking-0-24px ink60">{eyebrow}</p>}
            <p className="u-text-2xl fw-semibold u-leading-1-3 u-text-ink">{title}</p>
          </div>
          <CloseButton label={closeLabel} onClick={onClose} />
        </div>
        <div className={bodyClassName}>{children}</div>
        {footer && <div className="order-detail-actions">{footer}</div>}
      </aside>
    </div>
  );
}
