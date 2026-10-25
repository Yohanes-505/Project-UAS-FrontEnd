import { cx } from "@/lib/format";
import { FINANCE_SUMMARY } from "@/data/dashboard";

/** Panel ringkasan pendapatan bulan ini, target, kanal, dan performa. */
export function FinancePanel() {
  const f = FINANCE_SUMMARY;
  return (
    <section className="finance-panel work-surface reveal" style={{ animationDelay: "150ms" }}>
      <div className="finance-summary">
        <span>Pendapatan bulan ini</span>
        <strong>{f.revenue}</strong>
        <small>{f.targetLabel}</small>
      </div>
      <div className="target-track" aria-label={`${f.targetPercent} persen target pendapatan`}>
        <span style={{ width: `${f.targetPercent}%` }} />
      </div>
      <div className="channel-list">
        {f.channels.map((channel) => (
          <div key={channel.name} className="channel-row">
            <span>{channel.name}</span>
            <strong>{channel.amount}</strong>
            <small>{channel.share}</small>
          </div>
        ))}
      </div>
      <div className="performance-list">
        {f.performance.map((item) => (
          <div key={item.label} className={cx(item.danger && "is-danger")}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
