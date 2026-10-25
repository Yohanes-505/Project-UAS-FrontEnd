import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { HelpGuide } from "@/data/help";

/** Satu kartu "Panduan Cepat". Klik = pindah ke halaman terkait. */
export function HelpGuideCard({ guide }: { guide: HelpGuide }) {
  return (
    <Link href={guide.href} className="help-guide-card text-decoration-none">
      <span className="help-guide-icon">
        <Icon name={guide.icon} />
      </span>
      <div>
        <strong>{guide.title}</strong>
        <small>{guide.description}</small>
      </div>
      <Icon name="arrow-up-right" className="help-guide-arrow" />
    </Link>
  );
}
