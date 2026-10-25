import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Pembungkus isi tiap halaman admin (pengganti <main id="page-..."> di file asli).
 *
 *   <AdminPage id="page-pesanan">
 *     <PageHeading title="Kelola Pesanan" subtitle="..." actions={<Button variant="pill">...</Button>} />
 *     ...
 *   </AdminPage>
 */
export function AdminPage({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main id={id} className={cx("page-shell d-flex w-100 flex-column u-gap-6 u-p-8", className)}>
      {children}
    </main>
  );
}

/** Judul + deskripsi di atas halaman, dengan tombol aksi di kanan. */
export function PageHeading({
  title,
  subtitle,
  badge,
  actions,
  delay = 40,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Elemen kecil di samping judul, mis. pil "Terhubung ke Website". */
  badge?: ReactNode;
  actions?: ReactNode;
  delay?: number;
}) {
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  return (
    <div
      className="reveal d-flex w-100 flex-wrap align-items-center justify-content-between u-gap-4"
      style={style}
    >
      <div className="d-flex flex-column u-gap-1">
        {badge ? (
          <div className="d-flex flex-wrap align-items-center u-gap-2">
            <p className="u-text-base fw-semibold u-leading-6 u-text-ink">{title}</p>
            {badge}
          </div>
        ) : (
          <p className="u-text-base fw-semibold u-leading-6 u-text-ink">{title}</p>
        )}
        {subtitle && <p className="u-text-sm ink60">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap align-items-center u-gap-2">{actions}</div>}
    </div>
  );
}

/** Halaman sementara untuk menu yang belum dikerjakan. */
export function PagePlaceholder({ title, owner }: { title: string; owner?: string }) {
  return (
    <main id="page-placeholder" className="d-flex w-100 flex-column u-gap-2 u-p-8">
      <div
        className="d-flex u-h-420px w-100 flex-column align-items-center justify-content-center u-gap-2 u-rounded-2xl u-border u-border-dashed bg-white"
        style={{ borderColor: "rgba(59,31,20,.2)" }}
      >
        <p className="u-font-anton u-text-2xl u-leading-1-3 u-text-ink">{title.toUpperCase()}</p>
        <p className="u-text-sm ink60">
          Halaman {title} sedang dikerjakan{owner ? ` oleh ${owner}` : ""}.
        </p>
      </div>
    </main>
  );
}
