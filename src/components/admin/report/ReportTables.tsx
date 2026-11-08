import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { reportRupiah, type DailyRow, type TopMenu } from "@/lib/reports";

export function ReportTopMenuPanel({ items }: { items: TopMenu[] }) {
  return (
    <section className="reveal report-panel" style={{ animationDelay: "290ms" }}>
      <div className="report-card-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Menu Terlaris</p>
          <p className="u-text-xs ink60">Berdasarkan jumlah porsi terjual</p>
        </div>
        <Link href="/admin-dashboard/menu" className="report-link-btn">
          Kelola menu <Icon name="arrow-up-right" className="u-size-3" />
        </Link>
      </div>
      <div id="report-top-menu" className="report-menu-list">
        {items.length === 0 && <p className="u-text-xs ink60" style={{ padding: "12px 0" }}>Belum ada pesanan pada periode ini.</p>}
        {items.map((item, i) => (
          <div key={item.name} className="report-menu-item">
            <div className="report-rank">{i + 1}</div>
            <div className="report-menu-name"><strong>{item.name}</strong><small>{item.qty.toLocaleString("id-ID")} porsi terjual</small></div>
            <div className="report-menu-sales"><strong>{reportRupiah(item.revenue, true)}</strong><small>pendapatan</small></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportDailyPanel({ rows, todayLabel }: { rows: DailyRow[]; todayLabel: string }) {
  return (
    <section className="reveal report-panel" style={{ animationDelay: "320ms" }}>
      <div className="report-card-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Ringkasan 7 Hari Terakhir</p>
          <p className="u-text-xs ink60">Pesanan dan pendapatan harian</p>
        </div>
        <span className="report-mini-total">{todayLabel}</span>
      </div>
      <div className="report-table-wrap">
        <table className="report-table">
          <thead><tr><th>TANGGAL</th><th>PESANAN</th><th>PENDAPATAN</th><th>AVG.</th></tr></thead>
          <tbody id="report-daily-rows">
            {rows.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.orders.toLocaleString("id-ID")}</td>
                <td>{reportRupiah(d.revenue)}</td>
                <td>{d.aov ? reportRupiah(d.aov, true) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
