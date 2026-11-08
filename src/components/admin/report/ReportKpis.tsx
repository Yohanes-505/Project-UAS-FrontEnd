import { Icon, type IconName } from "@/components/ui/Icon";
import { reportRupiah, type Delta, type ReportSum } from "@/lib/reports";

interface Props { sum: ReportSum; revenueDelta: Delta; ordersDelta: Delta }

export function ReportKpis({ sum, revenueDelta, ordersDelta }: Props) {
  const cards: Array<{ icon: IconName; tone: string; label: string; id: string; value: string; note: string; noteTone: string }> = [
    { icon: "wallet-cards", tone: "maroon", label: "Total Pendapatan", id: "revenue", value: reportRupiah(sum.revenue, true), note: revenueDelta.text, noteTone: revenueDelta.tone },
    { icon: "receipt-text", tone: "amber", label: "Total Pesanan", id: "orders", value: sum.orders.toLocaleString("id-ID"), note: ordersDelta.text, noteTone: ordersDelta.tone },
    { icon: "circle-dollar-sign", tone: "green", label: "Rata-rata Transaksi", id: "aov", value: reportRupiah(sum.aov, true), note: "per pesanan", noteTone: "" },
    { icon: "circle-check-big", tone: "blue", label: "Pesanan Selesai", id: "completion", value: `${Math.round(sum.completion * 100)}%`, note: `${sum.completed.toLocaleString("id-ID")} pesanan selesai`, noteTone: "positive" },
  ];
  return (
    <div className="report-kpi-grid">
      {cards.map((c, i) => (
        <article key={c.id} className="reveal report-kpi-card" style={{ animationDelay: `${80 + i * 30}ms` }}>
          <div className={`report-kpi-icon ${c.tone}`}><Icon name={c.icon} /></div>
          <div>
            <p className="report-kpi-label">{c.label}</p>
            <p id={`report-kpi-${c.id}`} className="report-kpi-value">{c.value}</p>
            <p className={`report-kpi-note ${c.noteTone}`}>{c.note}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
