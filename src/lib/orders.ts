import { isoShift, rupiah, rupiahNumber } from "@/lib/format";
import { textMatches } from "@/lib/booking";
import type { Order, OrderStatus } from "@/types";

export const ORDER_STATUS_PARAM = "status";
export const ORDER_LATE_MINUTES = 30;

export function ordersHref(status?: OrderStatus | string): string {
  const base = "/admin-dashboard/pesanan";
  return status ? `${base}?${ORDER_STATUS_PARAM}=${encodeURIComponent(status)}` : base;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6,
  agu: 7, agt: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11,
};

export function orderTimestamp(order: Pick<Order, "date" | "time">): Date | null {
  const d = String(order.date || "").trim().split(/\s+/);
  const t = String(order.time || "").split(/[:.]/);
  const month = MONTHS[String(d[1] || "").slice(0, 3).toLowerCase()];
  if (d.length < 3 || month === undefined || t.length < 2) return null;
  return new Date(Number(d[2]), month, Number(d[0]), Number(t[0]), Number(t[1]));
}

export function countByStatus(orders: Order[], status: OrderStatus): number {
  return orders.filter((order) => order.status === status).length;
}

export function countLateOrders(orders: Order[], now: number): number {
  return orders.filter((order) => {
    if (order.status !== "Baru" && order.status !== "Diproses") return false;
    const ts = orderTimestamp(order);
    return !!ts && now - ts.getTime() > ORDER_LATE_MINUTES * 60000;
  }).length;
}

export function dashboardDateLabel(orders: Order[]): string {
  const latest = orders[0];
  const ts = latest ? orderTimestamp(latest) : null;
  if (!latest || !ts) return "Minggu, 28 Sep 2026";
  const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(ts);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${latest.date}`;
}

export const ORDER_TABS: Array<"Semua" | OrderStatus> = ["Semua", "Baru", "Diproses", "Siap", "Selesai", "Dibatalkan"];
export const ORDER_CHANNELS = ["Makan di Tempat", "Ambil Sendiri", "Ojek Online", "Katering"];
export const ORDER_PAYMENTS = ["QRIS", "Tunai", "Transfer Bank", "GoPay", "OVO"];
export const ORDER_NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string; timeline: string }>> = {
  Baru: { status: "Diproses", label: "Proses Pesanan", timeline: "Pesanan diproses" },
  Diproses: { status: "Siap", label: "Tandai Siap", timeline: "Pesanan siap" },
  Siap: { status: "Selesai", label: "Selesaikan Pesanan", timeline: "Pesanan selesai" },
};

export const ORDER_STEPS = ["Pesanan diterima", "Pesanan diproses", "Pesanan siap", "Pesanan selesai"];
export const orderStepIndex = (status: OrderStatus): number => ({ Baru: 0, Diproses: 1, Siap: 2, Selesai: 3 })[status as string] ?? -1;

export interface OrderFilters {
  search: string;
  status: "Semua" | OrderStatus;
  channel: string;
  date: string;
}
export const ORDER_FILTERS_DEFAULT: OrderFilters = { search: "", status: "Semua", channel: "Semua", date: "Hari ini" };

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
export function latestOrderDate(orders: Order[]): Date | null {
  let best: Date | null = null;
  for (const o of orders) {
    const ts = orderTimestamp(o);
    if (ts && (!best || ts > best)) best = ts;
  }
  return best;
}

function matchesDate(order: Order, filter: string, anchor: Date | null): boolean {
  const ts = orderTimestamp(order);
  if (!ts || !anchor) return true;
  if (filter === "Hari ini") return dayStart(ts) === dayStart(anchor);
  if (filter === "7 hari") return dayStart(ts) > dayStart(anchor) - 7 * 86400000 && dayStart(ts) <= dayStart(anchor);
  if (filter === "Bulan ini") return ts.getMonth() === anchor.getMonth() && ts.getFullYear() === anchor.getFullYear();
  return true;
}

export function ordersBase(list: Order[], f: OrderFilters): Order[] {
  const anchor = latestOrderDate(list);
  return list.filter(
    (o) =>
      (f.channel === "Semua" || o.channel === f.channel) &&
      matchesDate(o, f.date, anchor) &&
      textMatches(f.search, o.id, o.customer, o.phone, o.summary, o.channel, o.channelInfo),
  );
}

export function filterOrders(list: Order[], f: OrderFilters): Order[] {
  return ordersBase(list, f).filter((o) => f.status === "Semua" || o.status === f.status);
}

export function nextOrderId(list: Order[], now = new Date()): string {
  const yymm = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0");
  const re = new RegExp(`^#LB-${yymm}-(\\d+)$`);
  const max = list.reduce((n, o) => Math.max(n, Number(re.exec(o.id)?.[1]) || 0), 0);
  return `#LB-${yymm}-${String(max + 1).padStart(3, "0")}`;
}

export const orderLineTotal = (item: Order["items"][number]): number => item[1] * rupiahNumber(item[2]);
export { rupiah };

export { isoShift };
