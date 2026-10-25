"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cx } from "@/lib/format";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Class lapisan gelap. Default: tengah layar dengan latar 32% gelap. */
  overlayClassName?: string;
  /** id elemen judul di dalam children (untuk screen reader). */
  labelledBy?: string;
  describedBy?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Jendela dialog di tengah layar. Menutup saat klik latar atau tekan Escape,
 * menjaga fokus Tab tetap di dalam dialog, dan mengembalikan fokus
 * ke tombol pemicu setelah ditutup.
 */
export function Modal({
  open,
  onClose,
  overlayClassName = "logout-confirm position-fixed u-inset-0 u-z-60 d-flex align-items-center justify-content-center",
  labelledBy,
  describedBy,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return;
    const lastFocus = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => lastFocus?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cx(overlayClassName)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || !ref.current) return;
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {children}
    </div>
  );
}
