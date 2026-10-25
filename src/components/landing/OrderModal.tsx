"use client";

import { useMemo, useState, type FormEvent } from "react";
import { MENU_DATA_DEFAULT } from "@/data/menu";
import { ORDER_DATA_DEFAULT } from "@/data/orders";
import { PROMO_DATA_DEFAULT } from "@/data/promo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { rupiah } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Order, OrderItem } from "@/types";
import { ORDER_CHANNELS, ORDER_CHANNEL_INFO } from "./content";
import type { OrderOptions } from "./context";
import { isValidPhone, jamMenit, nextId, promoPercent, stempelWaktu, tanggalPendek } from "./lib";
import { LandingModal, ModalHead } from "./LandingModal";

interface Row {
  menuId: string;
  qty: number;
}

const MAX_QTY = 20;

/** Modal "Pesan Sekarang". Pesanan disimpan ke localStorage yang sama dengan dashboard admin. */
export function OrderModal({ options, onClose }: { options: OrderOptions | null; onClose: () => void }) {
  return (
    <LandingModal open={options !== null} onClose={onClose} labelledBy="orderTitle">
      {options && <OrderForm key={`${options.menuId ?? ""}|${options.promoId ?? ""}`} options={options} onClose={onClose} />}
    </LandingModal>
  );
}

function OrderForm({ options, onClose }: { options: OrderOptions; onClose: () => void }) {
  const [menu] = useLocalStorage(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
  const [promos] = useLocalStorage(STORAGE_KEYS.promo, PROMO_DATA_DEFAULT);
  const [orders, setOrders] = useLocalStorage(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);

  const available = useMemo(() => menu.filter((m) => m.website && m.available && m.stock > 0), [menu]);
  const promo = useMemo(
    () => promos.find((p) => p.id === options.promoId && p.active && p.website) ?? null,
    [promos, options.promoId],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<(typeof ORDER_CHANNELS)[number]>("Makan di Tempat");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([{ menuId: options.menuId ?? "", qty: 1 }]);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; name: string } | null>(null);

  const priceOf = (id: string) => menu.find((m) => m.id === id)?.price ?? 0;
  const subtotal = rows.reduce((sum, r) => sum + priceOf(r.menuId) * r.qty, 0);
  const percent = promo ? promoPercent(promo.type, promo.value) : 0;
  const discount = Math.floor((subtotal * percent) / 100);
  const total = subtotal - discount;

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Isi nama pemesan dulu ya.");
    if (!isValidPhone(phone)) return setError("Nomor WhatsApp belum valid. Contoh: 0812-3456-7890.");

    // gabungkan baris yang memilih menu sama
    const merged = new Map<string, number>();
    for (const r of rows) {
      if (!r.menuId) continue;
      merged.set(r.menuId, Math.min(MAX_QTY, (merged.get(r.menuId) ?? 0) + Math.max(1, r.qty)));
    }
    if (merged.size === 0) return setError("Pilih minimal satu menu.");

    const items: OrderItem[] = [];
    for (const [id, qty] of merged) {
      const m = menu.find((x) => x.id === id);
      if (!m) continue;
      if (qty > m.stock) return setError(`Stok ${m.name} tinggal ${m.stock}.`);
      items.push([m.name, qty, rupiah(m.price)]);
    }

    const now = new Date();
    const id = nextId(orders.map((o) => o.id), "LB", now);
    const catatan = [note.trim(), promo ? `Promo: ${promo.name}` : ""].filter(Boolean).join(" · ");
    const order: Order = {
      id,
      customer: name.trim(),
      phone: phone.trim(),
      items,
      summary: items.map(([n, q]) => `${n} ×${q}`).join(", "),
      channel,
      channelInfo: ORDER_CHANNEL_INFO[channel],
      time: jamMenit(now),
      date: tanggalPendek(now),
      total: rupiah(total),
      subtotal: rupiah(subtotal),
      discount: rupiah(discount),
      status: "Baru",
      payment: "Bayar di kasir",
      paymentStatus: "BELUM BAYAR",
      note: catatan || "Tidak ada catatan.",
      timeline: [[jamMenit(now), "Pesanan diterima"]],
    };
    setOrders((prev) => [order, ...prev]);
    setDone({ id, name: name.trim() });
  }

  if (done) {
    return (
      <div className="order-done">
        <ModalHead id="orderTitle" title="Pesanan Diterima" onClose={onClose} />
        <p>Terima kasih, {done.name}! Pesananmu sudah masuk ke dapur kami.</p>
        <p className="order-done-id">{done.id}</p>
        <p>Simpan nomor pesanan ini dan sebutkan ke kasir saat membayar.</p>
        <button type="button" className="btn-solid-red" onClick={onClose}>
          Tutup
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <ModalHead id="orderTitle" title="Pesan Sekarang" onClose={onClose} />

      {promo && (
        <div className="order-promo-banner">
          <strong>
            {promo.name} · {promo.value}
          </strong>
          <small>{percent > 0 ? promo.desc : `${promo.desc} Kasir akan menerapkannya saat konfirmasi.`}</small>
        </div>
      )}

      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="ordName">Nama</label>
          <input id="ordName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="order-field">
          <label htmlFor="ordPhone">No. WhatsApp</label>
          <input
            id="ordPhone"
            type="tel"
            inputMode="tel"
            placeholder="0812-3456-7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="order-field">
        <label htmlFor="ordChannel">Cara menerima pesanan</label>
        <select id="ordChannel" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
          {ORDER_CHANNELS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="order-items-head">
        <label>Menu</label>
        {rows.length < 8 && (
          <button type="button" className="order-link-btn" onClick={() => setRows((p) => [...p, { menuId: "", qty: 1 }])}>
            + Tambah menu
          </button>
        )}
      </div>
      {rows.map((r, i) => (
        <div className="order-item-row" key={i}>
          <select aria-label={`Menu ${i + 1}`} value={r.menuId} onChange={(e) => updateRow(i, { menuId: e.target.value })}>
            <option value="">Pilih menu…</option>
            {available.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {rupiah(m.price)}
              </option>
            ))}
          </select>
          <input
            aria-label={`Jumlah menu ${i + 1}`}
            type="number"
            min={1}
            max={MAX_QTY}
            value={r.qty}
            onChange={(e) => updateRow(i, { qty: Math.min(MAX_QTY, Math.max(1, Number(e.target.value) || 1)) })}
          />
          <button
            type="button"
            className="order-item-remove"
            aria-label={`Hapus menu ${i + 1}`}
            disabled={rows.length === 1}
            onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))}
          >
            ×
          </button>
        </div>
      ))}

      <div className="order-field" style={{ marginTop: 12 }}>
        <label htmlFor="ordNote">Catatan (opsional)</label>
        <textarea id="ordNote" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. sambal dipisah" />
      </div>

      {discount > 0 && (
        <div className="order-discount-row">
          <span>Diskon {promo?.value}</span>
          <span>−{rupiah(discount)}</span>
        </div>
      )}
      <div className="order-total-row">
        <span>Total</span>
        <strong>{rupiah(total)}</strong>
      </div>

      {error && (
        <p className="order-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-solid-red order-submit">
        Kirim Pesanan
      </button>
    </form>
  );
}