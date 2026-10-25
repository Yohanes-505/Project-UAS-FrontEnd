"use client";

import { useState, type FormEvent } from "react";
import { CATERING_DATA_DEFAULT } from "@/data/catering";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { rupiah, todayISO, isoShift } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Catering } from "@/types";
import { CATERING_EVENTS, CATERING_RULES, type CateringService } from "./content";
import { isValidPhone, nextId, stempelWaktu } from "./lib";
import { LandingModal, ModalHead } from "./LandingModal";

const SERVICES = Object.keys(CATERING_RULES) as CateringService[];

/** Modal permintaan katering. Disimpan sebagai status "Menunggu" di halaman Katering admin. */
export function CateringModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <LandingModal open={open} onClose={onClose} labelledBy="cateringTitle" panelClassName="catering-modal-panel">
      {open && <CateringForm onClose={onClose} />}
    </LandingModal>
  );
}

function CateringForm({ onClose }: { onClose: () => void }) {
  const [list, setList] = useLocalStorage(STORAGE_KEYS.catering, CATERING_DATA_DEFAULT);
  const minDate = isoShift(todayISO(), 2);

  const [customer, setCustomer] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [event, setEvent] = useState(CATERING_EVENTS[0]);
  const [service, setService] = useState<CateringService>("Nasi Kotak");
  const [pkg, setPkg] = useState<string>(CATERING_RULES["Nasi Kotak"].packages[0]);
  const [pax, setPax] = useState<number>(CATERING_RULES["Nasi Kotak"].minPax);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; text: string } | null>(null);

  const rule = CATERING_RULES[service];
  const total = rule.price * pax;

  function pickService(s: CateringService) {
    setService(s);
    setPkg(CATERING_RULES[s].packages[0]);
    setPax((p) => Math.max(p, CATERING_RULES[s].minPax));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (customer.trim().length < 2) return setError("Isi nama pemesan atau instansi.");
    if (!isValidPhone(phone)) return setError("Nomor WhatsApp belum valid. Contoh: 0812-3456-7890.");
    if (!date || date < minDate) return setError("Katering dipesan minimal 2 hari sebelum acara.");
    if (pax < rule.minPax) return setError(`Minimal pesanan ${service} adalah ${rule.minPax} ${rule.unit}.`);
    if (address.trim().length < 5) return setError("Isi alamat pengantaran.");

    const id = nextId(list.map((c) => c.id), "KT");
    const record: Catering = {
      id,
      customer: customer.trim(),
      pic: pic.trim() || customer.trim(),
      phone: phone.trim(),
      date,
      time,
      pax,
      event,
      service,
      package: pkg,
      address: address.trim(),
      total,
      dp: 0,
      source: "Website",
      status: "Menunggu",
      note: note.trim() || "Tidak ada catatan.",
      createdAt: stempelWaktu(),
    };
    setList((prev) => [record, ...prev]);
    setDone({ id, text: `${pkg} · ${pax} ${rule.unit} · ${date} pukul ${time}` });
  }

  if (done) {
    return (
      <div className="order-done" id="catDoneView">
        <ModalHead id="cateringTitle" title="Permintaan Terkirim" onClose={onClose} />
        <p className="order-done-id">{done.id}</p>
        <p className="catering-done-summary">{done.text}</p>
        <p>Tim kami akan menghubungi lewat WhatsApp untuk konfirmasi menu, harga akhir, dan uang muka.</p>
        <button type="button" className="btn-solid-red" onClick={onClose}>
          Tutup
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <ModalHead
        id="cateringTitle"
        title="Pesan Katering"
        sub="Isi data acara, lalu kami hubungi untuk konfirmasi."
        onClose={onClose}
      />

      <p className="catering-step">1. Data pemesan</p>
      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="ktName">Nama / instansi</label>
          <input id="ktName" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        <div className="order-field">
          <label htmlFor="ktPic">Nama PIC (opsional)</label>
          <input id="ktPic" value={pic} onChange={(e) => setPic(e.target.value)} />
        </div>
      </div>
      <div className="order-field">
        <label htmlFor="ktPhone">No. WhatsApp</label>
        <input id="ktPhone" type="tel" inputMode="tel" placeholder="0812-3456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <p className="catering-step">2. Acara</p>
      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="ktDate">Tanggal acara</label>
          <input id="ktDate" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="order-field">
          <label htmlFor="ktTime">Jam antar</label>
          <input id="ktTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="order-field">
        <label htmlFor="ktEvent">Jenis acara</label>
        <select id="ktEvent" value={event} onChange={(e) => setEvent(e.target.value)}>
          {CATERING_EVENTS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>

      <p className="catering-step">3. Layanan dan paket</p>
      <div className="order-field">
        <span className="catering-label">Layanan</span>
        <div className="catering-service-options" role="radiogroup" aria-label="Layanan">
          {SERVICES.map((s) => (
            <label className="catering-service-option" key={s}>
              <input type="radio" name="ktService" checked={service === s} onChange={() => pickService(s)} />
              <span className="catering-service-card">
                <strong>{s}</strong>
                <small>
                  {CATERING_RULES[s].desc} Mulai {rupiah(CATERING_RULES[s].price)}/{CATERING_RULES[s].unit}, min. {CATERING_RULES[s].minPax}.
                </small>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="order-grid-2">
        <div className="order-field">
          <label htmlFor="ktPkg">Paket</label>
          <select id="ktPkg" value={pkg} onChange={(e) => setPkg(e.target.value)}>
            {rule.packages.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="order-field">
          <label htmlFor="ktPax">Jumlah ({rule.unit})</label>
          <input id="ktPax" type="number" min={rule.minPax} max={1000} value={pax} onChange={(e) => setPax(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <p className="catering-step">4. Pengantaran</p>
      <div className="order-field">
        <label htmlFor="ktAddr">Alamat lengkap</label>
        <textarea id="ktAddr" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="order-field">
        <label htmlFor="ktNote">Catatan (opsional)</label>
        <textarea id="ktNote" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <span className="catering-hint">Mis. kebutuhan sendok, label perusahaan, atau jam setup.</span>
      </div>

      <div className="order-total-row catering-estimate">
        <div>
          <span>Estimasi total</span>
          <small>
            {pax} {rule.unit} × {rupiah(rule.price)}
          </small>
        </div>
        <strong>{rupiah(total)}</strong>
      </div>
      <p className="catering-disclaimer">Ini hanya estimasi. Harga akhir dikonfirmasi tim kami setelah menu dan lokasi disepakati.</p>

      {error && (
        <p className="order-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-solid-red order-submit">
        Kirim Permintaan
      </button>
    </form>
  );
}