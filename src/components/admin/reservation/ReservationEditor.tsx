"use client";

import { useState } from "react";
import { FormHint } from "@/components/admin/booking";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { BOOKING_SOURCES } from "@/lib/booking";
import { RESERVATION_AREAS, RESERVATION_STATUS_OPTIONS, reservationHoursValid } from "@/lib/reservations";
import type { Reservation, ReservationStatus, Settings } from "@/types";

const NOTE_MAX = 220;

/** data form tanpa id & createdAt */
export type ReservationPayload = Omit<Reservation, "id" | "createdAt">;

interface ReservationEditorProps {
  /** reservasi yang diedit */
  initial: Reservation;
  settings: Settings;
  onClose: () => void;
  onSave: (payload: ReservationPayload) => void;
}

/** form tambah ato edit reservasi */
export function ReservationEditor({ initial, settings, onClose, onSave }: ReservationEditorProps) {
  const showToast = useToast();
  const isNew = !initial.id;

  const [customer, setCustomer] = useState(initial.customer);
  const [phone, setPhone] = useState(initial.phone);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [pax, setPax] = useState(String(initial.pax));
  const [table, setTable] = useState(initial.table);
  const [area, setArea] = useState(initial.area);
  const [source, setSource] = useState(initial.source);
  const [occasion, setOccasion] = useState(initial.occasion);
  const [status, setStatus] = useState<ReservationStatus>(initial.status);
  const [note, setNote] = useState(isNew ? "" : initial.note);

  const handleSave = () => {
    const paxNumber = Number(pax);
    if (!customer.trim() || !phone.trim() || !date || !time || !paxNumber) {
      showToast("Nama, nomor WhatsApp, tanggal, waktu, dan jumlah tamu wajib diisi.");
      return;
    }
    if (!reservationHoursValid(date, time, settings)) {
      showToast("Waktu reservasi berada di luar jam buka Lamak Bana.");
      return;
    }
    onSave({
      customer: customer.trim(),
      phone: phone.trim(),
      date,
      time,
      pax: paxNumber,
      table: table.trim(),
      area,
      source,
      status,
      occasion: occasion.trim(),
      note: note.trim() || "Tidak ada catatan khusus.",
    });
  };

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="RESERVASI"
      title={isNew ? "Reservasi Baru" : "Edit Reservasi"}
      panelClassName="menu-editor-panel"
      bodyClassName="menu-editor-body"
      closeLabel="Tutup form"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button icon="save" onClick={handleSave}>Simpan Reservasi</Button>
        </>
      }
    >
      <div className="menu-form-row">
        <label className="menu-field">
          <span>Nama Pelanggan</span>
          <input id="reservation-form-name" type="text" placeholder="Nama pelanggan"
            value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>No. WhatsApp</span>
          <input id="reservation-form-phone" type="tel" placeholder="08xx-xxxx-xxxx"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Tanggal</span>
          <input id="reservation-form-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Waktu</span>
          <input id="reservation-form-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Jumlah Tamu</span>
          <input id="reservation-form-pax" type="number" min={1} max={30}
            value={pax} onChange={(e) => setPax(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Meja</span>
          <input id="reservation-form-table" type="text" placeholder="Contoh: Meja 12"
            value={table} onChange={(e) => setTable(e.target.value)} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Area</span>
          <Select id="reservation-form-area" value={area} onChange={setArea} options={RESERVATION_AREAS} />
        </label>
        <label className="menu-field">
          <span>Sumber</span>
          <Select id="reservation-form-source" value={source} onChange={setSource} options={BOOKING_SOURCES} />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Acara / Keperluan</span>
          <input id="reservation-form-occasion" type="text" placeholder="Contoh: Makan keluarga"
            value={occasion} onChange={(e) => setOccasion(e.target.value)} />
        </label>
        <label className="menu-field">
          <span>Status</span>
          <Select id="reservation-form-status" value={status}
            onChange={(v) => setStatus(v as ReservationStatus)} options={RESERVATION_STATUS_OPTIONS} />
        </label>
      </div>

      <label className="menu-field">
        <span>Catatan</span>
        <textarea id="reservation-form-note" rows={4} maxLength={NOTE_MAX}
          placeholder="Permintaan tempat duduk, alergi, kursi bayi, dan lainnya..."
          value={note} onChange={(e) => setNote(e.target.value)} />
        <small><span id="reservation-note-count">{note.length}</span>/{NOTE_MAX} karakter</small>
      </label>

      <FormHint>Pastikan waktu reservasi berada dalam jam operasional restoran.</FormHint>
    </Drawer>
  );
}
