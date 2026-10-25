"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cx } from "@/lib/format";

const MENU_BASE =
  "anim-pop position-absolute u-top-calc-100-8px u-z-50 u-rounded-xl u-border u-border-solid border-soft bg-white u-p-1-5 u-shadow-0-12px-32px-rgba-59-31-20-16";

interface DropdownProps {
  /** Nama dropdown (dipakai untuk atribut data-dropdown / data-menu seperti file asli). */
  id: string;
  /** Isi tombol pemicu. */
  trigger: ReactNode;
  triggerClassName: string;
  triggerLabel?: string;
  /** Menu menempel ke kiri atau kanan tombol. */
  align?: "left" | "right";
  /** Class tambahan menu, mis. "u-min-w-180px" atau "quick-action-menu". */
  menuClassName?: string;
  /** Class wrapper, mis. "order-filter-dropdown". */
  className?: string;
  wrapperId?: string;
  /** Isi menu. Panggil `close()` setelah opsi dipilih. */
  children: (close: () => void) => ReactNode;
}

/**
 * Dropdown dengan latar gelap 20% (pengganti sistem data-dropdown + #overlay).
 * Biasanya tidak dipakai langsung: pakai <FilterDropdown> untuk filter.
 */
export function Dropdown({
  id,
  trigger,
  triggerClassName,
  triggerLabel,
  align = "left",
  menuClassName = "u-min-w-180px",
  className,
  wrapperId,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Kartu `.reveal` membuat stacking context sendiri, jadi diangkat
  // ke atas latar gelap selama menu terbuka (sama seperti file asli).
  const setHostActive = (active: boolean) => {
    wrapRef.current?.closest(".reveal")?.classList.toggle("menu-host-active", active);
  };

  const openRef = useRef(false);

  const close = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    setClosing(true);
  }, []);

  const openMenu = () => {
    openRef.current = true;
    setClosing(false);
    setOpen(true);
  };

  useEscapeKey(close, open);

  useEffect(() => {
    if (open) setHostActive(true);
  }, [open]);

  const finishClosing = () => {
    if (open) return;
    setClosing(false);
    setHostActive(false);
  };

  return (
    <div ref={wrapRef} id={wrapperId} className={cx("position-relative", className)}>
      <button
        type="button"
        data-dropdown={id}
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          if (open) close();
          else openMenu();
        }}
      >
        {trigger}
      </button>

      <div
        data-menu={id}
        role="menu"
        className={cx(
          MENU_BASE,
          align === "right" ? "origin-tr u-right-0" : "u-left-0",
          menuClassName,
          open && "open",
          closing && "closing",
        )}
        onAnimationEnd={finishClosing}
      >
        {(open || closing) && children(close)}
      </div>

      {open &&
        createPortal(
          <div
            className="position-fixed u-inset-0 u-z-40 anim-fade"
            style={{ background: "rgba(0,0,0,.2)" }}
            onClick={close}
          />,
          document.body,
        )}
    </div>
  );
}
