"use client";

import { useState } from "react";
import { FormHint } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { BOOKING_SOURCES } from "@/lib/booking";
import { CATERING_EVENTS, CATERING_SERVICES, CATERING_STATUS_OPTIONS } from "@/lib/catering";
import type { Catering, CateringStatus } from "@/types";

const NOTE_MAX = 260;
const ADDRESS_MAX = 240;

/** fata form tanpa id & createdAt */
export type CateringPayload = Omit<Catering, "id" | "createdAt">;

interface CateringEditorProps {
  /** pesanan yang diedit */
  initial: Catering;
  onClose: () => void;
  onSave: (payload: CateringPayload) => void;
}

/**
 * form tambah or edit pesanan katering */
export function CateringEditor({ initial, onClose, onSave }: CateringEditorProps) {
  const showToast = useToast();
  const isNew = !initial.id;

  const [customer, setCustomer] = useState(initial.customer);
  const [pic, setPic] = useState(initial.pic);
  const [phone, setPhone] = useState(initial.phone);
  const [source, setSource] = useState(initial.source);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [event, setEvent] = useState(initial.event);
  const [service, setService] = useState(initial.service);
  const [pax, setPax] = useState(String(initial.pax));
  const [status, setStatus] = useState<CateringStatus>(initial.status);
  const [pack, setPack] = useState(initial.package);
  const [address, setAddress] = useState(initial.address);
  const [total, setTotal] = useState(isNew ? "" : String(initial.total));
  const [dp, setDp] = useState(String(initial.dp));
  const [note, setNote] = useState(isNew ? "" : initial.note);

  const handleSave = () => {
    const paxNumber = Number(pax);
    const totalNumber = Number(total);
    const dpNumber = Number(dp || 0);
    if (!customer.trim() || !pic.trim() || !phone.trim() || !date || !time || !paxNumber || !pack.trim() || !totalNumber) {
      showToast("Nama/perusahaan, PIC, kontak, jadwal, pax, paket, dan total pesanan wajib diisi.");
      return;
    }
    if (dpNumber > totalNumber) {
      showToast("Nilai DP tidak boleh lebih besar dari total pesanan.");
      return;
    }
    onSave({
      customer: customer.trim(),
      pic: pic.trim(),
      phone: phone.trim(),
      date,
      time,
      pax: paxNumber,
      event,
      service,
      package: pack.trim(),
      address: address.trim(),
      total: totalNumber,
      dp: dpNumber,
      source,
      status,
      note: note.trim() || "Tidak ada catatan khusus.",
    });
  };

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="KATERING"
      title={isNew ? "Katering Baru" : "Edit Katering"}
      panelClassName="catering-editor-panel"
      bodyClassName="menu-editor-body"
      closeLabel="Tutup form"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button icon="save" onClick={handleSave}>Simpan Katering</Button>
        </>
      }
    >
      <div className="menu-form-row">
        <label className="menu-field">
          <span>Nama / Perusahaan</span>
          <input id="catering-form-customer" type="text" placeholder="Contoh: PT Sinar Jaya"
            value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>PIC</span>
          <input id="catering-form-pic" type="text" placeholder="Nama penanggung jawab"
            value={pic} onChange={(e) => setPic(e.target.value)} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>No. WhatsApp</span>
          <input id="catering-form-phone" type="tel" placeholder="08xx-xxxx-xxxx"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Sumber</span>
          <Select id="catering-form-source" value={source} onChange={setSource} options={BOOKING_SOURCES} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Tanggal Acara</span>
          <input id="catering-form-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Waktu</span>
          <input id="catering-form-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Jenis Acara</span>
          <Select id="catering-form-event" value={event} onChange={setEvent} options={CATERING_EVENTS} />
        </label>
        <label className="menu-field">
          <span>Jenis Layanan</span>
          <Select id="catering-form-service" value={service} onChange={setService} options={CATERING_SERVICES} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Jumlah Pax</span>
          <input id="catering-form-pax" type="number" min={10} step={1} value={pax} onChange={(e) => setPax(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Status</span>
          <Select id="catering-form-status" value={status}
            onChange={(v) => setStatus(v as CateringStatus)} options={CATERING_STATUS_OPTIONS} />
        </label>
      </div>

      <label className="menu-field">
        <span>Paket / Menu</span>
        <input id="catering-form-package" type="text" placeholder="Contoh: Nasi Kotak Rendang + Ayam Pop"
          value={pack} onChange={(e) => setPack(e.target.value)} />
      </label>

      <label className="menu-field">
        <span>Alamat / Lokasi Acara</span>
        <textarea id="catering-form-address" rows={3} maxLength={ADDRESS_MAX}
          placeholder="Alamat pengantaran atau lokasi acara"
          value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Total Pesanan</span>
          <input id="catering-form-total" type="number" min={0} step={1000} placeholder="1400000"
            value={total} onChange={(e) => setTotal(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>DP Dibayar</span>
          <input id="catering-form-dp" type="number" min={0} step={1000} placeholder="700000"
            value={dp} onChange={(e) => setDp(e.target.value)} />
        </label>
      </div>

      <label className="menu-field">
        <span>Catatan</span>
        <textarea id="catering-form-note" rows={4} maxLength={NOTE_MAX}
          placeholder="Peralatan, setup, permintaan menu, waktu pengiriman, dan lainnya..."
          value={note} onChange={(e) => setNote(e.target.value)} />
        <small><span id="catering-note-count">{note.length}</span>/{NOTE_MAX} karakter</small>
      </label>

      <FormHint>
        Pastikan tanggal, jumlah pax, lokasi, paket, dan pembayaran sudah dikonfirmasi sebelum pesanan masuk tahap Produksi.
      </FormHint>
    </Drawer>
  );
}
