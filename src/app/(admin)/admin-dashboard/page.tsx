"use client";

import { useRouter } from "next/navigation";
import { AnalyticsPanel } from "@/components/admin/dashboard/AnalyticsPanel";
import { FinancePanel } from "@/components/admin/dashboard/FinancePanel";
import { OpsQueue, type OpsMetric } from "@/components/admin/dashboard/OpsQueue";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { SideRail, type PriorityRow } from "@/components/admin/dashboard/SideRail";
import { AGENDA_NEXT, ATTENTION_WARNINGS, ORDER_DATA_DEFAULT } from "@/data";
import { useLocalStorage, useNow } from "@/hooks";
import { countByStatus, countLateOrders, dashboardDateLabel, ordersHref } from "@/lib/orders";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Order } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stored] = useLocalStorage<Order[]>(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);
  const orders = Array.isArray(stored) ? stored : ORDER_DATA_DEFAULT;
  const now = useNow(60000);
  const late = now === null ? 0 : countLateOrders(orders, now);

  const priorities: PriorityRow[] = [
    ...(late
      ? [{
          key: "late",
          title: `${late} pesanan terlambat`,
          hint: "Lewati estimasi waktu",
          tone: "danger" as const,
          onClick: () => router.push(ordersHref("Diproses")),
        }]
      : []),
    ...ATTENTION_WARNINGS.map((item) => ({
      key: item.href,
      title: item.title,
      hint: item.hint,
      tone: "warning" as const,
      onClick: () => router.push(item.href),
    })),
  ];

  const metrics: OpsMetric[] = [
    { key: "attention", value: priorities.length, title: "Perlu dicek", hint: "butuh tindakan", tone: "alert", onClick: () => router.push(ordersHref("Diproses")) },
    { key: "baru", value: countByStatus(orders, "Baru"), title: "Baru", hint: "belum diproses", onClick: () => router.push(ordersHref("Baru")) },
    { key: "diproses", value: countByStatus(orders, "Diproses"), title: "Diproses", hint: "di dapur", onClick: () => router.push(ordersHref("Diproses")) },
    { key: "siap", value: countByStatus(orders, "Siap"), title: "Siap", hint: "untuk disajikan", onClick: () => router.push(ordersHref("Siap")) },
    { key: "late", value: late, title: "Terlambat", hint: "lewati estimasi", tone: "danger", onClick: () => router.push(ordersHref("Diproses")) },
  ];

  return (
    <main id="page-dashboard" className="page-shell dashboard-unslopped d-flex w-100 flex-column">
      <OpsQueue dateLabel={dashboardDateLabel(orders)} metrics={metrics} />

      <div className="dashboard-work-grid">
        <RecentOrders orders={orders} onOpenAll={() => router.push(ordersHref())} />
        <SideRail priorities={priorities} agenda={AGENDA_NEXT} onOpenAgenda={(item) => router.push(item.href)} />
      </div>

      <div className="dashboard-analysis-grid">
        <AnalyticsPanel />
        <FinancePanel />
      </div>
    </main>
  );
}
