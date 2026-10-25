import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Kartu pengaturan: ikon + judul + keterangan di atas, isi lewat `children`.
 *
 *   <SettingsCard icon="store" title="Informasi Restoran" subtitle="..." delay={130}>
 *     ...isi kartu...
 *   </SettingsCard>
 */
export function SettingsCard({
  icon,
  title,
  subtitle,
  delay = 100,
  children,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <article className="reveal settings-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="settings-card-head">
        <span className="settings-card-icon">
          <Icon name={icon} />
        </span>
        <div>
          <p className="u-text-base fw-semibold u-text-ink">{title}</p>
          <p className="u-text-xs ink60">{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  );
}
