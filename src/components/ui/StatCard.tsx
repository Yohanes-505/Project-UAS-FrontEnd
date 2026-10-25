import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";
import { Icon, type IconName } from "./Icon";

/**
 * Kartu angka ringkasan di atas halaman.
 * `variant` menentukan nama class asli yang dipakai:
 *   order       -> order-stat-card / order-stat-icon / order-stat-number
 *   menu        -> menu-stat-card ...
 *   reservation -> reservation-stat-card ...
 *   catering    -> catering-stat-card ...
 *
 *   <StatCard variant="reservation" icon="clock-3" iconClassName="reservation-icon-amber"
 *             label="Menunggu Konfirmasi" value={pending} caption="perlu ditindaklanjuti"
 *             onClick={() => setStatus("Menunggu")} delay={110} />
 */
type Variant = "order" | "menu" | "reservation" | "catering";

interface StatCardProps {
  variant: Variant;
  icon: IconName;
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  /** Class warna ikon, mis. "menu-stat-maroon" atau "reservation-icon-amber". */
  iconClassName?: string;
  /** Warna ikon lewat inline style (dipakai halaman Pesanan). */
  iconStyle?: CSSProperties;
  /** Class teks caption untuk variant "order". Default "u-text-xs ink60". */
  captionClassName?: string;
  /** Kalau diisi, kartu jadi tombol yang bisa diklik. */
  onClick?: () => void;
  /** Delay animasi muncul (ms). */
  delay?: number;
  className?: string;
}

export function StatCard({
  variant,
  icon,
  label,
  value,
  caption,
  iconClassName,
  iconStyle,
  captionClassName = "u-text-xs ink60",
  onClick,
  delay,
  className,
}: StatCardProps) {
  const classes = cx(`${variant}-stat-card reveal`, onClick && "text-start", className);
  const style = delay !== undefined ? { animationDelay: `${delay}ms` } : undefined;

  const content = (
    <>
      <span className={cx(`${variant}-stat-icon`, iconClassName)} style={iconStyle}>
        <Icon name={icon} className="u-size-5" />
      </span>
      {variant === "order" ? (
        <div className="d-flex flex-column u-gap-1">
          <p className="u-text-xs ink60">{label}</p>
          <div className="d-flex align-items-end u-gap-2">
            <p className="order-stat-number">{value}</p>
            {caption && <span className={captionClassName}>{caption}</span>}
          </div>
        </div>
      ) : (
        <div>
          <p className="u-text-xs ink60">{label}</p>
          <p className={`${variant}-stat-number`}>{value}</p>
          {caption && <p className={`${variant}-stat-caption`}>{caption}</p>}
        </div>
      )}
    </>
  );

  return onClick ? (
    <button type="button" className={classes} style={style} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={classes} style={style}>
      {content}
    </div>
  );
}
