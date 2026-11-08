import { REPORT_STATUS_ORDER, reportRupiah } from "@/lib/reports";

interface ChannelRow { name: string; color: string; revenue: number }

export function ReportChannelPanel({ rows, activeChannel }: { rows: ChannelRow[]; activeChannel: string }) {
  const total = rows.reduce((s, c) => s + c.revenue, 0);
  return (
    <section className="reveal report-panel" style={{ animationDelay: "230ms" }}>
      <div className="report-card-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Pendapatan per Kanal</p>
          <p className="u-text-xs ink60">Kontribusi dari seluruh transaksi</p>
        </div>
        <span id="report-channel-total" className="report-mini-total">{reportRupiah(total, true)}</span>
      </div>
      <div id="report-channel-breakdown" className="report-channel-list">
        {rows.map((c) => {
          const pct = total ? Math.round((c.revenue / total) * 100) : 0;
          const dim = activeChannel !== "Semua" && activeChannel !== c.name;
          return (
            <div key={c.name} className="report-channel-row" style={{ opacity: dim ? 0.42 : 1 }}>
              <div className="report-channel-name"><span className="report-channel-dot" style={{ background: c.color }} /><span>{c.name}</span></div>
              <div className="report-channel-bar"><i style={{ width: `${pct}%`, background: c.color }} /></div>
              <div className="report-channel-value"><strong>{reportRupiah(c.revenue, true)}</strong><small>{pct}%</small></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ReportStatusPanel({ counts, total }: { counts: Record<string, number>; total: number }) {
  return (
    <section className="reveal report-panel" style={{ animationDelay: "260ms" }}>
      <div className="report-card-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Status Pesanan</p>
          <p className="u-text-xs ink60">Distribusi proses pesanan</p>
        </div>
        <span id="report-status-total" className="report-mini-total">{total.toLocaleString("id-ID")} pesanan</span>
      </div>
      <div id="report-status-breakdown" className="report-status-list">
        {REPORT_STATUS_ORDER.map((st) => {
          const count = counts[st.name] ?? 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={st.name} className="report-status-row">
              <div className="report-status-label"><span className="report-status-badge-dot" style={{ background: st.color }} />{st.name}</div>
              <div className="report-status-bar"><i style={{ width: `${pct}%`, background: st.color }} /></div>
              <div className="report-status-count">{count.toLocaleString("id-ID")} · {pct}%</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
