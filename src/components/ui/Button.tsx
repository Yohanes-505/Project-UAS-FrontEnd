import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/format";
import { Icon, type IconName } from "./Icon";

/**
 * Tombol-tombol yang sering dipakai di admin.
 *
 * - "primary" / "secondary": tombol di footer drawer & form (class asli `drawer-btn`).
 * - "pill": tombol merah bulat di kanan atas halaman ("Pesanan Baru", "Tambah Menu").
 * - "pill-outline": tombol bulat putih ("Preview Website").
 */
type Variant = "primary" | "secondary" | "pill" | "pill-outline";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "drawer-btn drawer-btn-primary",
  secondary: "drawer-btn drawer-btn-secondary",
  pill: "press d-flex align-items-center u-gap-2 rounded-pill u-bg-maroon u-px-4 u-py-2-5 u-text-sm fw-medium text-white",
  "pill-outline":
    "menu-secondary-button press d-flex align-items-center u-gap-2 rounded-pill u-px-4 u-py-2-5 u-text-sm fw-medium",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx(VARIANT_CLASS[variant], className)} {...rest}>
      {icon && <Icon name={icon} className="u-size-4" />}
      {children}
    </button>
  );
}

/** Tombol bulat kecil berisi ikon X untuk menutup drawer/panel. */
export function CloseButton({
  label = "Tutup",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        "u-grid u-size-7 u-place-items-center rounded-pill ink60 u-transition-colors u-hover-bg-rgba-59-31-20-06",
        className,
      )}
      {...rest}
    >
      <Icon name="x" className="u-size-4" />
    </button>
  );
}
