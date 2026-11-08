"use client";

import { useMemo, useState } from "react";
import { FormHint } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { rupiah } from "@/lib/format";
import { ORDER_CHANNELS, ORDER_PAYMENTS } from "@/lib/orders";
import type { MenuItem, Order, OrderItem } from "@/types";

export type OrderPayload = Pick<Order, "customer" | "phone" | "channel" | "channelInfo" | "payment" | "note" | "items">;

interface Row { menuId: string; qty: string }
export function OrderEditor({ menu, onClose, onSave }: { menu: MenuItem[]; onClose: () => void; onSave: (p: OrderPayload) => void }) {
  const showToast = useToast();
  const available = useMemo(() => menu.filter((m) => m.available && m.stock > 0), [menu]);

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState(ORDER_CHANNELS[0]);
  const [channelInfo, setChannelInfo] = useState("");
  const [payment, setPayment] = useState(ORDER_PAYMENTS[0]);
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([{ menuId: available[0]?.id ?? "", qty: "1" }]);

  const options = available.map((m) => ({ value: m.id, label: `${m.name} · ${rupiah(m.price)}` }));
  const priceOf = (id: string) => menu.find((m) => m.id === id)?.price ?? 0;
  const qtyOf = (r: Row) => Math.max(1, Number(r.qty) || 1);
  const total = rows.reduce((sum, r) => sum + priceOf(r.menuId) * qtyOf(r), 0);
  const patchRow = (i: number, patch: Partial<Row>) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSave = () => {
    if (!customer.trim()) return showToast("Nama pelanggan wajib diisi.");
    const merged = new Map<string, number>();
    for (const r of rows) if (r.menuId) merged.set(r.menuId, (merged.get(r.menuId) ?? 0) + qtyOf(r));
    if (merged.size === 0) return showToast("Pilih minimal satu menu.");

    const items: OrderItem[] = [];
    for (const [id, qty] of merged) {
      const m = menu.find((x) => x.id === id);
      if (!m) continue;
      if (qty > m.stock) return showToast(`Stok ${m.name} tinggal ${m.stock}.`);
      items.push([m.name, qty, rupiah(m.price)]);
    }
    onSave({
      customer: customer.trim(),
      phone: phone.trim() || "-",
      channel,
      channelInfo: channelInfo.trim() || (channel === "Makan di Tempat" ? "Meja belum ditentukan" : "-"),
      payment,
      note: note.trim() || "Tidak ada catatan khusus.",
      items,
    });
  };

  return (
    <Drawer open onClose={onClose} eyebrow="PESANAN" title="Pesanan Baru" panelClassName="menu-editor-panel"
      bodyClassName="menu-editor-body" closeLabel="Tutup form"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon="save" onClick={handleSave}>Simpan Pesanan</Button></>}>
      <div className="menu-form-row">
        <label className="menu-field"><span>Nama Pelanggan</span>
          <input id="order-form-customer" type="text" placeholder="Nama pelanggan" value={customer} onChange={(e) => setCustomer(e.target.value)} /></label>
        <label className="menu-field"><span>No. Telepon</span>
          <input id="order-form-phone" type="tel" placeholder="08xx-xxxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      </div>
      <div className="menu-form-row">
        <label className="menu-field"><span>Kanal</span><Select value={channel} onChange={setChannel} options={ORDER_CHANNELS} /></label>
        <label className="menu-field"><span>Info Kanal</span>
          <input id="order-form-channel-info" type="text" placeholder="Contoh: Meja 05" value={channelInfo} onChange={(e) => setChannelInfo(e.target.value)} /></label>
      </div>

      <div className="menu-field">
        <span>Menu Pesanan</span>
        {available.length === 0 && <FormHint>Belum ada menu yang tersedia. Aktifkan menu dulu di halaman Menu Makanan.</FormHint>}
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 70px 92px 32px", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <Select value={r.menuId} onChange={(v) => patchRow(i, { menuId: v })} options={options} placeholder="Pilih menu" aria-label="Menu" />
            <input type="number" min={1} value={r.qty} aria-label="Jumlah" onChange={(e) => patchRow(i, { qty: e.target.value })} />
            <span className="u-text-xs ink60 text-end">{rupiah(priceOf(r.menuId) * qtyOf(r))}</span>
            <button type="button" aria-label="Hapus menu" disabled={rows.length === 1}
              className="u-grid u-size-7 u-place-items-center rounded-pill ink60"
              onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))}>
              <Icon name="x" className="u-size-4" />
            </button>
          </div>
        ))}
        <button type="button" className="reservation-edit-link" onClick={() => setRows((p) => [...p, { menuId: available[0]?.id ?? "", qty: "1" }])}>
          <Icon name="plus" className="u-size-4" /> Tambah menu
        </button>
      </div>

      <div className="menu-form-row">
        <label className="menu-field"><span>Pembayaran</span><Select value={payment} onChange={setPayment} options={ORDER_PAYMENTS} /></label>
        <label className="menu-field"><span>Catatan</span>
          <input id="order-form-note" type="text" placeholder="Opsional" value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </div>

      <div className="detail-card">
        <div className="detail-total-row fw-semibold"><span>Total Pesanan</span><span className="u-text-maroon">{rupiah(total)}</span></div>
      </div>
    </Drawer>
  );
}
