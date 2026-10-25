"use client";

import { useEffect, useRef, useState } from "react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { LineChart } from "@/components/ui/LineChart";
import { DROPDOWN_OPTIONS } from "@/data/dropdown-options";
import { ORDER_TREND_SUMMARY, TREND_COMP, TREND_MAIN, TREND_MAX, trendDataForYear } from "@/data/dashboard";

const Y_TICKS = Array.from({ length: 7 }, (_, k) => ({
  value: k * 500,
  label: (k * 500).toLocaleString("en-US"),
}));
const X_LABELS = [0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29].map((index) => ({
  index,
  label: String(index + 1).padStart(2, "0"),
}));
const fmtVal = (v: number | null) =>
  (v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Series = { main: number[]; comp: number[] };

/** Panel "Tren Pesanan": grafik garis, ganti tahun = data bergerak mulus ke nilai baru. */
export function AnalyticsPanel() {
  const [year, setYear] = useState("2026");
  const [series, setSeries] = useState<Series>(() => trendDataForYear("2026"));
  const current = useRef<Series>(series);
  const frame = useRef(0);
  useEffect(() => {
    const target = trendDataForYear(year);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const commit = (next: Series) => {
      current.current = next;
      setSeries(next);
    };
    if (reduce) {
      commit(target);
      return;
    }
    const from = { main: current.current.main.slice(), comp: current.current.comp.slice() };
    const duration = 560;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      commit({
        main: from.main.map((v, i) => Math.round(v + (target.main[i] - v) * e)),
        comp: from.comp.map((v, i) => Math.round(v + (target.comp[i] - v) * e)),
      });
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [year]);

  return (
    <section className="analytics-panel work-surface reveal" style={{ animationDelay: "120ms" }}>
      <div className="work-surface-head analytics-head">
        <div>
          <h2>Tren Pesanan</h2>
          <div className="analytics-inline-metrics">
            <strong>{ORDER_TREND_SUMMARY.total}</strong>
            <span>{ORDER_TREND_SUMMARY.label}</span>
            <em>{ORDER_TREND_SUMMARY.growth}</em>
          </div>
        </div>
        <FilterDropdown
          id="tahun"
          variant="plain"
          align="right"
          value={year}
          onChange={setYear}
          options={DROPDOWN_OPTIONS.tahun}
          ariaLabel="Pilih tahun grafik"
        />
      </div>
      <LineChart
        main={series.main}
        comp={series.comp}
        max={TREND_MAX}
        yTicks={Y_TICKS}
        xLabels={X_LABELS}
        tipMain={(i) => ({ time: `Feb ${i + 1}, 2018 12:00`, value: fmtVal(series.main[i]) })}
        tipComp={(i) => ({ time: `Jan ${i + 1}, 2018 12:00`, value: fmtVal(series.comp[i]) })}
        ariaLabel={`Grafik tren pesanan harian tahun ${year}`}
      />
    </section>
  );
}

// Kurva dasar diekspor ulang supaya Laporan bisa memakai data yang sama bila perlu.
export { TREND_MAIN, TREND_COMP };
