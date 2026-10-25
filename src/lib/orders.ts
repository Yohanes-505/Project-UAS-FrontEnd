import { isoShift } from "@/lib/format";
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

export { isoShift };
