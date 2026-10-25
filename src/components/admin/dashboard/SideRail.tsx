import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/format";
import type { AgendaItem } from "@/data/dashboard";

export interface PriorityRow {
  key: string;
  title: string;
  hint: string;
  tone: "danger" | "warning";
  onClick: () => void;
}

/** Kolom kanan Dashboard: "Perlu Dicek" dan "Agenda Berikutnya". */
export function SideRail({
  priorities,
  agenda,
  onOpenAgenda,
}: {
  priorities: PriorityRow[];
  agenda: AgendaItem[];
  onOpenAgenda: (item: AgendaItem) => void;
}) {
  const count = priorities.length;
  return (
    <aside className="dashboard-side-rail reveal" style={{ animationDelay: "90ms" }}>
      <section className="side-section attention-section">
        <div className="side-section-head">
          <div>
            <h2>Perlu Dicek</h2>
            <p>{count ? `${count} item membutuhkan tindakan` : "Tidak ada yang perlu dicek"}</p>
          </div>
          <span className="attention-count">{count}</span>
        </div>
        <div className="priority-list">
          {priorities.map((row) => (
            <button key={row.key} type="button" className={cx("priority-row", `is-${row.tone}`)} onClick={row.onClick}>
              <span className="priority-signal" />
              <span>
                <strong>{row.title}</strong>
                <small>{row.hint}</small>
              </span>
              <Icon name="chevron-right" className="u-size-4" />
            </button>
          ))}
        </div>
      </section>

      <section className="side-section agenda-section">
        <div className="side-section-head">
          <div>
            <h2>Agenda Berikutnya</h2>
            <p>Reservasi &amp; katering</p>
          </div>
        </div>
        <div className="agenda-compact-list">
          {agenda.map((item) => (
            <button key={`${item.time}-${item.name}`} type="button" onClick={() => onOpenAgenda(item)}>
              <time>{item.time}</time>
              <span>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
