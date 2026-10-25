"use client";

import { useState, type FormEvent } from "react";
import { RESERVATION_DATA_DEFAULT } from "@/data/reservations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSettings } from "@/hooks/useSettings";
import { todayISO } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Reservation } from "@/types";
import { RESERVATION_AREAS } from "./content";
import { hoursFor, isValidPhone, isWeekendISO, jamTitik, nextId, reservationTimeError, stempelWaktu } from "./lib";
import { LandingModal, ModalHead } from "./LandingModal";

/** Modal reservasi meja. Masuk ke halaman Reservasi admin dengan status "Menunggu" dan sumber "Website". */
export function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <LandingModal open={open} onClose={onClose} labelledBy="reservasiTitle">
      {open && <ReservationForm onClose={onClose} />}
    </LandingModal>
  );
}

function ReservationForm({ onClose }: { onClose: () => void }) {
  const [list, setList] = useLocalStorage(STORAGE_KEYS.reservations, RESERVATION_DATA_DEFAULT);
  const [settings] = useSettings();
  const today = todayISO();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("12:00");
  const [pax, setPax] = useState(2);
  const [area, setArea] = useState(RESERVATION_AREAS[0]);
  const [occasion, setOccasion] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; text: string } | null>(null);

  const h = hoursFor(date ? isWeekendISO(date) : false, settings);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Isi nama pemesan dulu ya.");
    if (!isValidPhone(phone)) return setError("Nomor WhatsApp belum valid. Contoh: 0812-3456-7890.");
    if (!date || date < today) return setError("Pilih tanggal hari ini atau setelahnya.");
    const timeError = reservationTimeError(date, time, settings);
    if (timeError) return setError(timeError);
    if (pax < 1 || pax > 20) return setError("Jumlah tamu 1–20 orang. Untuk lebih banyak, gunakan katering.");

    const id = nextId(list.map((r) => r.id), "RS");
    const record: Reservation = {
      id,
      customer: name.trim(),
      phone: phone.trim(),
      date,
      time,
      pax,
      table: "Belum ditentukan",
      area,
      source: "Website",
      status: "Menunggu",
      occasion: occasion.trim() || "Makan",
      note: note.trim() || "Tidak ada catatan khusus.",
      createdAt: stempelWaktu(),
    };
    setList((prev) => [record, ...prev]);
    setDone({ id, text: `${pax} orang · ${area} · ${date} pukul ${time}` });
  }

  if (done) {
    return (
      <div className="order-done">
        <ModalHead id="reservasiTitle" title="Reservasi Terkirim" onClose={onClose} />
        <p className="order-done-id">{done.id}</p>
        <p className="catering-done-summary">{done.text}</p>
        <p>Kami akan mengonfirmasi mejamu lewat WhatsApp. Status awal: menunggu konfirmasi.</p>
        <button type="button" className="btn-solid-red" onClick={onClose}>
          Tutup
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <ModalHead id="reservasiTitle" title="Reservasi Meja" sub="Amankan meja sebelum datang." onClose={onClose} />

      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="rsName">Nama</label>
          <input id="rsName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="order-field">
          <label htmlFor="rsPhone">No. WhatsApp</label>
          <input id="rsPhone" type="tel" inputMode="tel" placeholder="0812-3456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="rsDate">Tanggal</label>
          <input id="rsDate" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="order-field">
          <label htmlFor="rsTime">Jam</label>
          <input id="rsTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <span className="catering-hint">
            Buka {jamTitik(h.open)}–{jamTitik(h.close)} WIB
          </span>
        </div>
      </div>
      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="rsPax">Jumlah tamu</label>
          <input id="rsPax" type="number" min={1} max={20} value={pax} onChange={(e) => setPax(Number(e.target.value) || 0)} />
        </div>
        <div className="order-field">
          <label htmlFor="rsArea">Area</label>
          <select id="rsArea" value={area} onChange={(e) => setArea(e.target.value)}>
            {RESERVATION_AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="order-field">
        <label htmlFor="rsOcc">Keperluan (opsional)</label>
        <input id="rsOcc" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Mis. makan keluarga, ulang tahun" />
      </div>
      <div className="order-field">
        <label htmlFor="rsNote">Catatan (opsional)</label>
        <textarea id="rsNote" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && (
        <p className="order-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-solid-red order-submit">
        Kirim Reservasi
      </button>
    </form>
  );
}