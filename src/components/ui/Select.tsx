"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { Icon } from "./Icon";

export interface SelectOption {
  value: string;
  label?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | SelectOption>;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const normalize = (opt: string | SelectOption): Required<SelectOption> =>
  typeof opt === "string" ? { value: opt, label: opt } : { value: opt.value, label: opt.label ?? opt.value };

/**
 * Pilihan dropdown untuk form (pengganti <select> yang di file asli
 * diubah jadi "unified-select" lewat jQuery).
 *
 *   <label className="menu-field">
 *     <span>Kategori</span>
 *     <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })}
 *             options={["Daging", "Ayam", "Gulai"]} />
 *   </label>
 *
 * <select> asli tetap ada (tersembunyi) supaya `name` ikut terbaca oleh FormData.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  name,
  placeholder = "Pilih opsi",
  disabled,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const listId = `${id ?? autoId}-listbox`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = options.map(normalize);
  const current = items.find((o) => o.value === value);

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  // Fokus ke opsi aktif saat dibuka.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const target =
      menu?.querySelector<HTMLButtonElement>(".unified-select-option.is-active") ??
      menu?.querySelector<HTMLButtonElement>(".unified-select-option");
    target?.focus();
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onOptionKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(".unified-select-option") ?? [],
    );
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={cx("unified-select", open && "is-open", className)}>
      <select
        id={id}
        name={name}
        className="unified-native"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {!current && <option value="">{placeholder}</option>}
        {items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        ref={triggerRef}
        type="button"
        className="unified-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          setOpen((o) => !o);
        }}
      >
        <span className={cx("unified-select-label", !value && "unified-select-placeholder")}>
          {current?.label || placeholder}
        </span>
        <Icon name="chevron-down" className="unified-select-chevron" />
      </button>

      <div ref={menuRef} id={listId} className="unified-select-menu" role="listbox">
        {items.map((o, index) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={active}
              className={cx("unified-select-option", active && "is-active")}
              onClick={(event) => {
                event.preventDefault();
                choose(o.value);
              }}
              onKeyDown={(event) => onOptionKey(event, index)}
            >
              <span>{o.label}</span>
              {active && <span className="unified-select-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
