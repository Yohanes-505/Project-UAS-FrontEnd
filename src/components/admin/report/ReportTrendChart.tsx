"use client";

import { useMemo } from "react";
import { LineChart } from "@/components/ui/LineChart";
import { reportNiceMax, reportRupiah, type TrendPoint } from "@/lib/reports";

export function ReportTrendChart({ data, subtitle }: { data: TrendPoint[]; subtitle: string }) {
  const { main, comp, max, yTicks, xLabels } = useMemo(() => {
    const peak = data.reduce((m, d) => Math.max(m, d.main ?? 0, d.prev ?? 0), 0);
    const max = reportNiceMax(peak);
    const N = data.length;
    const maxLabels = 12;
    const every = Math.max(1, Math.ceil(N / maxLabels));
    const xLabels = data
      .map((d, index) => ({ index, label: d.axis }))
      .filter(({ index }) => (index % every === 0 && N - 1 - index >= every / 2) || index === N - 1);
    return {
      main: data.map((d) => d.main),
      comp: data.map((d) => d.prev),
      max,
      peak,
      yTicks: Array.from({ length: 6 }, (_, k) => {
        const value = (max / 5) * k;
        return { value, label: value === 0 ? "0" : reportRupiah(value, true) };
      }),
      xLabels,
    };
  }, [data]);
  const empty = data.every((d) => !d.main && !d.prev);

  return (
    <section className="reveal report-chart-card" style={{ animationDelay: "200ms" }}>
      <div className="report-card-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Tren Penjualan</p>
          <p id="report-chart-subtitle" className="u-text-xs ink60">{subtitle}</p>
        </div>
        <div className="d-flex align-items-center u-gap-4">
          <div className="d-flex align-items-center u-gap-2"><span className="report-legend-solid" /><p className="u-text-xs ink60">Periode Ini</p></div>
          <div className="d-flex align-items-center u-gap-2"><span className="report-legend-dash" /><p className="u-text-xs ink60">Periode Sebelumnya</p></div>
        </div>
      </div>
      <div id="linechart" className="position-relative w-100 d-flex" style={{ height: 390 }}>
        <LineChart
          main={main}
          comp={comp}
          max={max}
          yTicks={yTicks}
          xLabels={xLabels}
          padLeft={72}
          fallbackHeight={390}
          ariaLabel="Grafik tren pendapatan"
          tipMain={(i) => ({ time: data[i].mainLabel, value: data[i].main === null ? "-" : reportRupiah(data[i].main!) })}
          tipComp={(i) => ({ time: data[i].prevLabel, value: data[i].prev === null ? "-" : reportRupiah(data[i].prev!) })}
        />
        {empty && (
          <p className="u-text-xs ink60" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", margin: 0 }}>
            Belum ada pesanan pada periode ini.
          </p>
        )}
      </div>
    </section>
  );
}
