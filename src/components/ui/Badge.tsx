import type { ReactNode } from "react";
import { STATUS_STYLE } from "@/data/status-styles";
import type { StatusStyle } from "@/types";

interface BadgeProps {
  /** Teks status, mis. "Diproses". Juga dipakai untuk mencari warnanya. */
  status: string;
  /**
   * Peta warna. Default: status pesanan.
   * Untuk reservasi/katering kirim RESERVATION_STATUS_STYLE / CATERING_STATUS_STYLE.
   */
  styles?: Record<string, StatusStyle>;
  /** Warna cadangan kalau status tidak ada di peta. */
  fallback?: StatusStyle;
  children?: ReactNode;
}

/** Label status berwarna (pengganti fungsi statusBadge / reservationBadge / cateringBadge). */
export function Badge({ status, styles = STATUS_STYLE, fallback, children }: BadgeProps) {
  const style = styles[status] ?? fallback ?? Object.values(styles)[0];
  return (
    <span
      className="d-inline-flex align-items-center rounded-pill u-px-2-5 u-py-0-5 u-text-xs fw-medium"
      style={{ background: style?.bg, color: style?.color }}
    >
      {children ?? status}
    </span>
  );
}
