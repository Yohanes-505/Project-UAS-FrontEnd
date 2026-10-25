import { cx } from "@/lib/format";

export interface OpsMetric {
  key: string;
  value: number;
  title: string;
  hint: string;
  tone?: "alert" | "danger";
  onClick: () => void;
}

/** Strip "Operasional Hari Ini": angka antrean yang bisa diklik ke halaman Pesanan. */
export function OpsQueue({ dateLabel, metrics }: { dateLabel: string; metrics: OpsMetric[] }) {
  return (
    <section className="ops-queue reveal" style={{ animationDelay: "20ms" }} aria-label="Antrean operasional hari ini">
      <div className="ops-queue-label">
        <span>OPERASIONAL HARI INI</span>
        <strong>{dateLabel}</strong>
      </div>
      <div className="ops-queue-metrics">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            className={cx("ops-metric", metric.tone && `is-${metric.tone}`)}
            onClick={metric.onClick}
          >
            <span className="ops-metric-value">{metric.value}</span>
            <span className="ops-metric-copy">
              <strong>{metric.title}</strong>
              <small>{metric.hint}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
