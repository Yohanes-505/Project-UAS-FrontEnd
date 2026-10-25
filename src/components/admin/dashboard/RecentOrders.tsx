"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Icon } from "@/components/ui/Icon";
import { DROPDOWN_OPTIONS } from "@/data/dropdown-options";
import type { Order } from "@/types";

const ROW_LIMIT = 5;

export function RecentOrders({ orders, onOpenAll }: { orders: Order[]; onOpenAll: () => void }) {
  const [status, setStatus] = useState("Semua");
  const [waktu, setWaktu] = useState("Hari ini");

  const filtered = status === "Semua" ? orders : orders.filter((order) => order.status === status);
  const rows = filtered.slice(0, ROW_LIMIT);

  return (
    <section className="work-surface recent-orders-panel reveal" style={{ animationDelay: "60ms" }}>
      <div className="work-surface-head">
        <div>
          <h2>Pesanan Hari Ini</h2>
          <p>{orders.length} pesanan · fokus pada antrean aktif</p>
        </div>
        <div className="d-flex align-items-center u-gap-2">
          <FilterDropdown
            id="status"
            variant="plain"
            prefix="Status: "
            value={status}
            onChange={setStatus}
            options={DROPDOWN_OPTIONS.status}
            ariaLabel="Filter status pesanan"
          />
          <FilterDropdown
            id="waktu"
            variant="plain"
            align="right"
            value={waktu}
            onChange={setWaktu}
            options={DROPDOWN_OPTIONS.waktu}
            ariaLabel="Filter waktu"
          />
        </div>
      </div>

      <div className="w-100 overflow-x-auto">
        <div className="u-min-w-880px compact-order-table">
          <div className="compact-table-head">
            <p className="u-w-120px flex-shrink-0">ID PESANAN</p>
            <p className="u-w-150px flex-shrink-0">PELANGGAN</p>
            <p className="u-min-w-0 u-flex-1">MENU</p>
            <p className="u-w-130px flex-shrink-0">KANAL</p>
            <p className="u-w-64px flex-shrink-0">WAKTU</p>
            <p className="u-w-120px flex-shrink-0 text-end">TOTAL</p>
            <p className="u-w-110px flex-shrink-0">STATUS</p>
          </div>
          <div id="orders">
            {rows.map((order) => (
              <div
                key={order.id}
                className="order-row d-flex w-100 align-items-center u-gap-4 u-border-b u-border-solid border-soft u-px-4 u-py-3-5"
              >
                <p className="u-w-120px flex-shrink-0 u-text-sm fw-medium u-leading-5 u-text-ink">{order.id}</p>
                <p className="u-w-150px flex-shrink-0 u-text-sm u-text-ink">{order.customer}</p>
                <p className="u-min-w-0 u-flex-1 u-text-sm u-text-ink">{order.summary}</p>
                <p className="u-w-130px flex-shrink-0 u-text-sm ink60">{order.channel}</p>
                <p className="u-w-64px flex-shrink-0 u-text-sm ink60">{order.time}</p>
                <p className="u-w-120px flex-shrink-0 text-end u-text-sm fw-medium u-leading-5 u-text-ink">{order.total}</p>
                <div className="u-w-110px flex-shrink-0">
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="u-px-4 u-py-3-5 u-text-sm ink60">Tidak ada pesanan dengan status {status}.</p>
            )}
          </div>
        </div>
      </div>

      <div className="table-footer-line">
        <span>Menampilkan {rows.length} pesanan terbaru</span>
        <button type="button" onClick={onOpenAll}>
          Buka semua pesanan <Icon name="arrow-right" className="u-size-4" />
        </button>
      </div>
    </section>
  );
}
