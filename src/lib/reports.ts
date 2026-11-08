import { rupiahNumber } from "@/lib/format";
import { DEMO_TODAY } from "@/lib/booking";
import { latestOrderDate, orderTimestamp } from "@/lib/orders";
import type { Order } from "@/types";

export const REPORT_CHANNEL_COLORS: Record<string, string> = {
  "Makan di Tempat": "#8b1e1e",
  "Ojek Online": "#d69223",
  Katering: "#2f5d3a",
  "Ambil Sendiri": "#265f87",
};

export const REPORT_STATUS_ORDER = [
  { name: "Selesai", color: "#2f5d3a" },
  { name: "Diproses", color: "#d69223" },
  { name: "Baru", color: "#8b1e1e" },
  { name: "Siap", color: "#265f87" },
  { name: "Dibatalkan", color: "#a45a5a" },
] as const;

export interface ReportFilters {
  period: string;
  channel: string;
  dateFrom: string;
  dateTo: string;
}

export interface DateRange { from: Date; to: Date }

export function reportRupiah(value: number, compact = false): string {
  const v = Number(value || 0);
  const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (compact) {
    if (v >= 1_000_000_000) return `Rp${fmt(v / 1_000_000_000)} M`;
    if (v >= 1_000_000) return `Rp${fmt(v / 1_000_000)} jt`;
    if (v >= 1_000) return `Rp${fmt(v / 1_000)} rb`;
  }
  return "Rp" + Math.round(v).toLocaleString("id-ID");
}

export const reportDateLabel = (d: Date): string =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export function reportToday(orders: Order[]): Date {
  return latestOrderDate(orders) ?? isoToDate(DEMO_TODAY);
}

export function reportDefaultFilters(today: Date): ReportFilters {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { period: "Bulan ini", channel: "Semua", dateFrom: iso(new Date(today.getFullYear(), today.getMonth(), 1)), dateTo: iso(today) };
}

export function reportRange(f: ReportFilters, today: Date): DateRange {
  if (f.period === "7 hari terakhir") {
    const from = startOfDay(today);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(today) };
  }
  if (f.period === "Tahun ini")
    return { from: new Date(today.getFullYear(), 0, 1), to: endOfDay(new Date(today.getFullYear(), 11, 31)) };
  if (f.period === "Rentang tanggal") {
    const a = isoToDate(f.dateFrom), b = isoToDate(f.dateTo);
    if (!isNaN(a.getTime()) && !isNaN(b.getTime()) && b >= a) return { from: a, to: endOfDay(b) };
  }
  return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0)) };
}

export function reportPrevRange(f: ReportFilters, r: DateRange): DateRange {
  if (f.period === "Bulan ini")
    return { from: new Date(r.from.getFullYear(), r.from.getMonth() - 1, 1), to: endOfDay(new Date(r.from.getFullYear(), r.from.getMonth(), 0)) };
  if (f.period === "Tahun ini")
    return { from: new Date(r.from.getFullYear() - 1, 0, 1), to: endOfDay(new Date(r.from.getFullYear() - 1, 11, 31)) };
  const days = dayDiff(r.from, r.to) + 1;
  const from = startOfDay(r.from);
  from.setDate(from.getDate() - days);
  const to = startOfDay(r.from);
  to.setDate(to.getDate() - 1);
  return { from, to: endOfDay(to) };
}

export function reportPeriodText(f: ReportFilters, r: DateRange): string {
  if (f.period === "Bulan ini") return r.from.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  if (f.period === "Tahun ini") return String(r.from.getFullYear());
  return `${reportDateLabel(r.from)} – ${reportDateLabel(r.to)}`;
}

export function reportOrders(orders: Order[], from: Date, to: Date, channel: string): Order[] {
  return orders.filter((o) => {
    const ts = orderTimestamp(o);
    if (!ts || ts < from || ts > to) return false;
    return !channel || channel === "Semua" || o.channel === channel;
  });
}

export interface ReportSum { orders: number; paid: number; revenue: number; aov: number; completed: number; completion: number }

export function reportSum(list: Order[]): ReportSum {
  const paid = list.filter((o) => o.status !== "Dibatalkan");
  const revenue = paid.reduce((s, o) => s + rupiahNumber(o.total), 0);
  const completed = list.filter((o) => o.status === "Selesai").length;
  return {
    orders: list.length,
    paid: paid.length,
    revenue,
    aov: paid.length ? Math.round(revenue / paid.length) : 0,
    completed,
    completion: list.length ? completed / list.length : 0,
  };
}

export interface DailyRow { date: string; orders: number; revenue: number; aov: number }

export function reportDaily(orders: Order[], from: Date, to: Date, channel: string, onlyWithOrders = false): DailyRow[] {
  const rows: DailyRow[] = [];
  const day = startOfDay(from);
  while (day <= to) {
    const s = reportSum(reportOrders(orders, startOfDay(day), endOfDay(day), channel));
    if (!onlyWithOrders || s.orders) rows.push({ date: reportDateLabel(day), orders: s.orders, revenue: s.revenue, aov: s.aov });
    day.setDate(day.getDate() + 1);
  }
  return rows;
}

export interface TopMenu { name: string; qty: number; revenue: number }

export function reportTopMenu(list: Order[], limit = 5): TopMenu[] {
  const sold: Record<string, TopMenu> = {};
  for (const o of list) {
    if (o.status === "Dibatalkan") continue;
    for (const it of Array.isArray(o.items) ? o.items : []) {
      const row = (sold[it[0]] ??= { name: it[0], qty: 0, revenue: 0 });
      const qty = Number(it[1]) || 0;
      row.qty += qty;
      row.revenue += qty * rupiahNumber(it[2]);
    }
  }
  return Object.values(sold).sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, limit);
}

export function reportByChannel(periodOrders: Order[]) {
  const names = Object.keys(REPORT_CHANNEL_COLORS);
  for (const o of periodOrders) if (!names.includes(o.channel)) names.push(o.channel);
  return names.map((name) => ({
    name,
    color: REPORT_CHANNEL_COLORS[name] ?? "#a45a5a",
    revenue: reportSum(periodOrders.filter((o) => o.channel === name)).revenue,
  }));
}

export interface Delta { text: string; tone: "positive" | "negative" | "" }
export function reportDelta(current: number, previous: number): Delta {
  if (!previous) return { text: current ? "Belum ada data pembanding" : "Belum ada data", tone: "" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct)}% vs periode sebelumnya`, tone: pct >= 0 ? "positive" : "negative" };
}

export interface TrendPoint { axis: string; mainLabel: string; prevLabel: string; main: number | null; prev: number | null }

export function reportNiceMax(v: number): number {
  if (v <= 0) return 100000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

export function reportTrend(orders: Order[], f: ReportFilters, today: Date): TrendPoint[] {
  const r = reportRange(f, today);
  const pr = reportPrevRange(f, r);
  const days = dayDiff(r.from, r.to) + 1;
  const monthly = f.period === "Tahun ini" || days > 92;
  const monthSpan = (a: DateRange) => (a.to.getFullYear() - a.from.getFullYear()) * 12 + a.to.getMonth() - a.from.getMonth() + 1;
  const count = monthly ? monthSpan(r) : days;
  const prevCount = monthly ? monthSpan(pr) : dayDiff(pr.from, pr.to) + 1;

  const bucketAt = (base: Date, i: number) =>
    monthly
      ? { from: new Date(base.getFullYear(), base.getMonth() + i, 1) }
      : { from: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i) };
  const indexOf = (base: Date, ts: Date) =>
    monthly ? (ts.getFullYear() - base.getFullYear()) * 12 + ts.getMonth() - base.getMonth() : dayDiff(base, ts);

  const fill = (range: DateRange, size: number) => {
    const sums = new Array<number>(size).fill(0);
    for (const o of reportOrders(orders, range.from, range.to, f.channel)) {
      if (o.status === "Dibatalkan") continue;
      const ts = orderTimestamp(o);
      if (!ts) continue;
      const idx = indexOf(range.from, ts);
      if (idx >= 0 && idx < size) sums[idx] += rupiahNumber(o.total);
    }
    return sums;
  };
  const mainSums = fill(r, count);
  const prevSums = fill(pr, prevCount);
  const label = (d: Date) => (monthly ? d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : reportDateLabel(d));
  const endToday = endOfDay(today);

  return Array.from({ length: count }, (_, i) => {
    const cb = bucketAt(r.from, i).from;
    const pb = bucketAt(pr.from, i).from;
    return {
      axis: monthly
        ? cb.toLocaleDateString("id-ID", { month: "short" })
        : count > 31
          ? cb.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : String(cb.getDate()).padStart(2, "0"),
      mainLabel: label(cb),
      prevLabel: label(pb),
      main: cb > endToday ? null : mainSums[i],
      prev: i < prevCount && pb <= endToday ? prevSums[i] : null,
    };
  });
}

/* ---------- Ekspor Excel (.xls berbasis HTML, seperti versi asli) ---------- */
export function buildReportExcel(opts: { periodText: string; channelLabel: string; sum: ReportSum; daily: DailyRow[] }): string {
  const { periodText, channelLabel, sum, daily } = opts;
  const rows: Array<Array<string | number>> = [
    ["Laporan Penjualan Lamak Bana"],
    ["Periode", periodText],
    ["Kanal", channelLabel],
    [],
    ["Ringkasan", "Nilai"],
    ["Total Pendapatan", reportRupiah(sum.revenue)],
    ["Total Pesanan", sum.orders],
    ["Rata-rata Transaksi", reportRupiah(sum.aov)],
    ["Pesanan Selesai", `${Math.round(sum.completion * 100)}% (${sum.completed} pesanan)`],
    [],
    ["Tanggal", "Pesanan", "Pendapatan", "Rata-rata"],
    ...daily.map((d) => [d.date, d.orders, reportRupiah(d.revenue), d.aov ? reportRupiah(d.aov) : "-"]),
  ];
  const esc = (c: string | number) => String(c).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
  return `<html><head><meta charset="UTF-8"></head><body><table>${body}</table></body></html>`;
}

export function downloadReportExcel(html: string) {
  const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan-Penjualan-Lamak-Bana-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
