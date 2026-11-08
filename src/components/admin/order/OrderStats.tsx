import { StatCard } from "@/components/ui/StatCard";
import { countByStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";

export function OrderStats({ orders, onPickStatus }: { orders: Order[]; onPickStatus: (s: OrderStatus) => void }) {
  return (
    <div className="order-stat-grid">
      <StatCard variant="order" icon="bell-ring" label="Pesanan Baru" value={countByStatus(orders, "Baru")}
        caption="perlu tindakan" captionClassName="u-text-xs u-text-maroon"
        iconStyle={{ background: "rgba(139,30,30,.09)", color: "#8b1e1e" }} onClick={() => onPickStatus("Baru")} delay={80} />
      <StatCard variant="order" icon="chef-hat" label="Sedang Diproses" value={countByStatus(orders, "Diproses")}
        caption="di dapur" iconStyle={{ background: "rgba(242,169,59,.18)", color: "#9a6500" }}
        onClick={() => onPickStatus("Diproses")} delay={120} />
      <StatCard variant="order" icon="package-check" label="Siap Disajikan" value={countByStatus(orders, "Siap")}
        caption="siap diambil" captionClassName="u-text-xs u-text-leaf"
        iconStyle={{ background: "rgba(47,93,58,.10)", color: "#2f5d3a" }} onClick={() => onPickStatus("Siap")} delay={160} />
      <StatCard variant="order" icon="circle-check-big" label="Selesai Hari Ini" value={countByStatus(orders, "Selesai")}
        caption="pesanan" iconStyle={{ background: "rgba(47,93,58,.10)", color: "#2f5d3a" }}
        onClick={() => onPickStatus("Selesai")} delay={200} />
    </div>
  );
}
