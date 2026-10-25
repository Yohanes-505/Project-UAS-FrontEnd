"use client";

import { useEffect, useRef, useState } from "react";
import { dropdownLabel } from "@/data/dropdown-options";
import { cx } from "@/lib/format";
import { Dropdown } from "./Dropdown";
import { Icon, type IconName } from "./Icon";

const TRIGGER_CLASS = {
  /** Tombol filter di halaman Pesanan, Menu, Reservasi, Katering, Laporan. */
  pill: "filter-pill d-flex flex-shrink-0 align-items-center u-gap-1 rounded-pill u-border u-border-solid border-soft bg-white u-px-3 u-py-2 u-text-sm u-text-ink u-transition-colors",
  /** Tombol filter kecil di kartu Dashboard. */
  plain:
    "filter-pill d-flex flex-shrink-0 align-items-center u-gap-1 u-border u-border-solid border-soft u-px-3 u-py-1-5 u-text-sm u-text-ink",
};

interface FilterDropdownProps {
  /** Key dari DROPDOWN_OPTIONS, mis. "order-channel". Dipakai juga untuk teks label. */
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** Teks sebelum nilai, mis. "Status: " */
  prefix?: string;
  /** Ikon kecil di kiri (dipakai di Laporan). */
  icon?: IconName;
  align?: "left" | "right";
  variant?: keyof typeof TRIGGER_CLASS;
  /** Ganti cara teks nilai ditampilkan. Default: dropdownLabel(id, value). */
  formatLabel?: (value: string) => string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Tombol filter berbentuk pil + menu pilihan.
 *
 *   const [channel, setChannel] = useState("Semua");
 *   <FilterDropdown id="order-channel" value={channel} onChange={setChannel}
 *                   options={DROPDOWN_OPTIONS["order-channel"]} align="right"
 *                   className="order-filter-dropdown" ariaLabel="Filter kanal" />
 */
export function FilterDropdown({
  id,
  value,
  options,
  onChange,
  prefix,
  icon,
  align = "left",
  variant = "pill",
  formatLabel = (v) => dropdownLabel(id, v),
  className,
  ariaLabel,
}: FilterDropdownProps) {
  // Animasi kecil saat label berganti (class asli: label-swap).
  const [swapKey, setSwapKey] = useState(0);
  const firstValue = useRef(value);
  useEffect(() => {
    if (value !== firstValue.current) setSwapKey((k) => k + 1);
  }, [value]);

  return (
    <Dropdown
      id={id}
      align={align}
      className={className}
      triggerLabel={ariaLabel}
      triggerClassName={cx(TRIGGER_CLASS[variant], icon && "u-gap-2")}
      trigger={
        <>
          {icon && <Icon name={icon} className="u-size-4 ink60" />}
          {prefix}
          <span key={swapKey} data-label={id} className={swapKey > 0 ? "label-swap" : undefined}>
            {formatLabel(value)}
          </span>
          <Icon name="chevron-down" className="u-size-4" />
        </>
      }
    >
      {(close) =>
        options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              className={cx(
                "menu-opt d-flex w-100 align-items-center justify-content-between u-rounded-lg u-px-3 u-py-2 text-start u-text-sm",
                active && "is-active",
              )}
              style={{
                color: active ? "#8b1e1e" : "#3b1f14",
                fontWeight: active ? 500 : 400,
                background: active ? "rgba(139,30,30,.08)" : "transparent",
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (opt !== value) onChange(opt);
                close();
              }}
            >
              <span>{formatLabel(opt)}</span>
              {active && <span className="menu-check">✓</span>}
            </button>
          );
        })
      }
    </Dropdown>
  );
}
