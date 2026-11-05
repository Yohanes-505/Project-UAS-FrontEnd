"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { useEscape } from "./hooks";

interface LandingModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** class tambahan untuk lapisan luar (mis. "kategori-modal") */
  className?: string;
  /** class tambahan untuk panel (mis. "catering-modal-panel") */
  panelClassName?: string;
  children: ReactNode;
}

/** Kerangka modal landing: lapisan gelap + panel krem. Klik di luar panel atau tekan Esc untuk menutup. */
export function LandingModal({ open, onClose, labelledBy, className, panelClassName, children }: LandingModalProps) {
  useEscape(open, onClose);
  return (
    <div
      className={cx("order-modal", className, open && "open")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && <div className={cx("order-modal-panel", panelClassName)}>{children}</div>}
    </div>
  );
}

interface ModalHeadProps {
  id: string;
  title: string;
  sub?: string;
  onClose: () => void;
}

export function ModalHead({ id, title, sub, onClose }: ModalHeadProps) {
  return (
    <div className="order-modal-head">
      <div>
        <h2 className="order-modal-title" id={id}>
          {title}
        </h2>
        {sub && <p className="catering-modal-sub">{sub}</p>}
      </div>
      <button type="button" className="order-modal-close" aria-label="Tutup" onClick={onClose}>
        ×
      </button>
    </div>
  );
}