"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import {
  ReportChannelPanel,
  ReportDailyPanel,
  ReportKpis,
  ReportStatusPanel,
  ReportTopMenuPanel,
  ReportTrendChart,
} from "@/components/admin/report";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { useToast } from "@/components/ui/Toast";
import { DROPDOWN_OPTIONS, dropdownLabel, ORDER_DATA_DEFAULT } from "@/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  buildReportExcel,
  downloadReportExcel,
  reportByChannel,
  reportDaily,
  reportDateLabel,
  reportDefaultFilters,
  reportDelta,
  reportOrders,
  reportPeriodText,
  reportPrevRange,
  reportRange,
  reportSum,
  reportToday,
  reportTopMenu,
  reportTrend,
  type ReportFilters,
} from "@/lib/reports";
import { seedStorage, STORAGE_KEYS } from "@/lib/storage";
import { Icon } from "@/components/ui/Icon";
import type { Order } from "@/types";

export default function LaporanPage() {
  const showToast = useToast();
  const [stored, , ready] = useLocalStorage<Order[]>(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);
  const orders = Array.isArray(stored) ? stored : ORDER_DATA_DEFAULT;
  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT); }, [ready]);

  const today = useMemo(() => reportToday(orders), [orders]);
  const [filters, setFilters] = useState<ReportFilters | null>(null);
  const f = filters ?? reportDefaultFilters(today);
  const patch = (p: Partial<ReportFilters>) => setFilters({ ...f, ...p });

  const report = useMemo(() => {
    const range = reportRange(f, today);
    const prev = reportPrevRange(f, range);
    const filtered = reportOrders(orders, range.from, range.to, f.channel);
    const sum = reportSum(filtered);
    const prevSum = reportSum(reportOrders(orders, prev.from, prev.to, f.channel));
    const statusCounts: Record<string, number> = {};
    for (const o of filtered) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    const from7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    return {
      range,
      sum,
      periodText: reportPeriodText(f, range),
      revenueDelta: reportDelta(sum.revenue, prevSum.revenue),
      ordersDelta: reportDelta(sum.orders, prevSum.orders),
      channels: reportByChannel(reportOrders(orders, range.from, range.to, "Semua")),
      statusCounts,
      topMenu: reportTopMenu(filtered),
      daily7: reportDaily(orders, from7, today, f.channel),
      trend: reportTrend(orders, f, today),
    };
  }, [orders, f, today]);

  const channelLabel = dropdownLabel("report-channel", f.channel);

  const exportExcel = () => {
    const daily = reportDaily(orders, report.range.from, report.range.to, f.channel, true);
    downloadReportExcel(buildReportExcel({ periodText: report.periodText, channelLabel, sum: report.sum, daily }));
    showToast("Laporan Excel berhasil dibuat.");
  };

  return (
    <AdminPage id="page-laporan" className="report-page">
      <div className="reveal d-flex w-100 flex-wrap align-items-center justify-content-between u-gap-4" style={{ animationDelay: "40ms" }}>
        <div className="d-flex flex-column u-gap-1">
          <p className="u-text-base fw-semibold u-leading-6 u-text-ink">Laporan Penjualan</p>
          <p className="u-text-sm ink60">Pantau pendapatan, pesanan, dan menu terlaris berdasarkan periode dan kanal penjualan.</p>
        </div>
        <div className="d-flex flex-wrap align-items-center u-gap-2 report-top-actions">
          <FilterDropdown id="report-period" icon="calendar-range" align="right" value={f.period}
            options={DROPDOWN_OPTIONS["report-period"]} onChange={(period) => patch({ period })} ariaLabel="Pilih periode" />
          <FilterDropdown id="report-channel" icon="radio-tower" align="right" value={f.channel}
            options={DROPDOWN_OPTIONS["report-channel"]} onChange={(channel) => patch({ channel })} ariaLabel="Pilih kanal" />
          <button id="report-export-excel" type="button" className="report-action-btn" onClick={exportExcel}>
            <Icon name="file-spreadsheet" className="u-size-4" /> Excel
          </button>
          <button id="report-print" type="button" className="report-action-btn" onClick={() => window.print()}>
            <Icon name="printer" className="u-size-4" /> PDF / Cetak
          </button>
        </div>
      </div>

      {f.period === "Rentang tanggal" && (
        <div id="report-custom-range" className="reveal report-custom-range" style={{ animationDelay: "60ms" }}>
          <div>
            <label htmlFor="report-date-from">Dari tanggal</label>
            <input id="report-date-from" type="date" value={f.dateFrom} max={f.dateTo} onChange={(e) => patch({ dateFrom: e.target.value })} />
          </div>
          <span className="ink60">-</span>
          <div>
            <label htmlFor="report-date-to">Sampai tanggal</label>
            <input id="report-date-to" type="date" value={f.dateTo} min={f.dateFrom} onChange={(e) => patch({ dateTo: e.target.value })} />
          </div>
        </div>
      )}

      <ReportKpis sum={report.sum} revenueDelta={report.revenueDelta} ordersDelta={report.ordersDelta} />

      <ReportTrendChart data={report.trend} subtitle={`${report.periodText} · ${channelLabel}`} />

      <div className="report-two-col">
        <ReportChannelPanel rows={report.channels} activeChannel={f.channel} />
        <ReportStatusPanel counts={report.statusCounts} total={report.sum.orders} />
      </div>

      <div className="report-two-col report-bottom-grid">
        <ReportTopMenuPanel items={report.topMenu} />
        <ReportDailyPanel rows={report.daily7} todayLabel={reportDateLabel(today)} />
      </div>
    </AdminPage>
  );
}
