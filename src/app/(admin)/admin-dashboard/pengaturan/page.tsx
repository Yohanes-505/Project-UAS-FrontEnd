"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { SettingsCard } from "@/components/admin/settings/SettingsCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { SETTINGS_DEFAULT } from "@/data/settings";
import { useSettings } from "@/hooks/useSettings";
import { initials } from "@/lib/format";
import type { Settings } from "@/types";

const ROLES = ["Super Admin", "Admin", "Operator"];

type NotifKey = "notifOrder" | "notifReservation" | "notifCatering" | "notifStock";
type TimeKey = "weekdayOpen" | "weekdayClose" | "weekendOpen" | "weekendClose";

const NOTIF_ROWS: Array<{ key: NotifKey; title: string; hint: string }> = [
  { key: "notifOrder", title: "Pesanan Baru", hint: "Notifikasi ketika ada pesanan baru masuk." },
  { key: "notifReservation", title: "Reservasi Baru", hint: "Notifikasi reservasi yang perlu dikonfirmasi." },
  { key: "notifCatering", title: "Katering", hint: "Pengingat pesanan katering mendatang." },
  { key: "notifStock", title: "Stok Menipis", hint: "Peringatan ketika stok menu hampir habis." },
];

const HOUR_ROWS: Array<{ title: string; hint: string; open: TimeKey; close: TimeKey }> = [
  { title: "Senin – Jumat", hint: "Hari kerja", open: "weekdayOpen", close: "weekdayClose" },
  { title: "Sabtu – Minggu", hint: "Akhir pekan", open: "weekendOpen", close: "weekendClose" },
];

export default function PengaturanPage() {
  const showToast = useToast();
  const [saved, setSaved, ready] = useSettings();
  const [form, setForm] = useState<Settings>(SETTINGS_DEFAULT);
  const [loaded, setLoaded] = useState(false);

  // Isi form sekali, setelah data dari localStorage terbaca.
  useEffect(() => {
    if (ready && !loaded) {
      setForm(saved);
      setLoaded(true);
    }
  }, [ready, loaded, saved]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const next: Settings = {
      ...form,
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      storeName: form.storeName.trim(),
      storePhone: form.storePhone.trim(),
      storeCity: form.storeCity.trim(),
      storeAddress: form.storeAddress.trim(),
    };

    if (!next.adminName || !next.storeName) {
      showToast("Nama admin dan nama restoran wajib diisi.");
      return;
    }
    const { weekdayOpen: wo, weekdayClose: wc, weekendOpen: eo, weekendClose: ec } = next;
    if (!wo || !wc || !eo || !ec) {
      showToast("Lengkapi jam operasional.");
      return;
    }
    if (wc <= wo || ec <= eo) {
      showToast("Jam tutup harus lebih akhir dari jam buka.");
      return;
    }

    setSaved(next);
    setForm(next);
    showToast("Pengaturan berhasil disimpan.");
  };

  const handleReset = () => {
    setSaved(SETTINGS_DEFAULT);
    setForm(SETTINGS_DEFAULT);
    showToast("Pengaturan dikembalikan ke default.");
  };

  const previewName = form.adminName.trim() || "Admin Utama";

  return (
    <AdminPage id="page-settings" className="settings-page">
      <section className="reveal settings-head" style={{ animationDelay: "60ms" }}>
        <div>
          <p className="settings-kicker">
            <Icon name="settings-2" className="u-size-4" /> PENGATURAN ADMIN
          </p>
          <h2>Pengaturan Lamak Bana</h2>
          <p>Atur profil admin, informasi restoran, jam operasional, dan preferensi notifikasi.</p>
        </div>
        <div className="settings-head-actions">
          <button
            id="settings-reset"
            type="button"
            className="settings-secondary-btn"
            onClick={handleReset}
          >
            <Icon name="rotate-ccw" className="u-size-4" /> Reset
          </button>
          <Button id="settings-save" icon="save" onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </div>
      </section>

      <section className="settings-grid">
        <SettingsCard
          icon="user-round"
          title="Profil Admin"
          subtitle="Informasi yang tampil pada panel admin."
          delay={100}
        >
          <div className="settings-profile-preview">
            <span id="settings-avatar" className="settings-avatar">
              {initials(previewName)}
            </span>
            <div>
              <strong id="settings-preview-name">{previewName}</strong>
              <small id="settings-preview-role">{form.adminRole}</small>
            </div>
          </div>
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>Nama Admin</span>
              <input
                id="settings-admin-name"
                type="text"
                maxLength={60}
                value={form.adminName}
                onChange={(event) => set("adminName", event.target.value)}
              />
            </label>
            <label className="settings-field">
              <span>Role</span>
              <Select
                id="settings-admin-role"
                value={form.adminRole}
                onChange={(value) => set("adminRole", value)}
                options={ROLES}
              />
            </label>
            <label className="settings-field settings-span-2">
              <span>Email</span>
              <input
                id="settings-admin-email"
                type="email"
                placeholder="admin@contoh.com"
                value={form.adminEmail}
                onChange={(event) => set("adminEmail", event.target.value)}
              />
            </label>
          </div>
        </SettingsCard>

        <SettingsCard
          icon="store"
          title="Informasi Restoran"
          subtitle="Informasi dasar untuk kebutuhan website dan kontak pelanggan."
          delay={130}
        >
          <div className="settings-form-grid">
            <label className="settings-field settings-span-2">
              <span>Nama Restoran</span>
              <input
                id="settings-store-name"
                type="text"
                maxLength={80}
                value={form.storeName}
                onChange={(event) => set("storeName", event.target.value)}
              />
            </label>
            <label className="settings-field">
              <span>WhatsApp</span>
              <input
                id="settings-store-phone"
                type="text"
                maxLength={24}
                placeholder="08xxxxxxxxxx"
                value={form.storePhone}
                onChange={(event) => set("storePhone", event.target.value)}
              />
            </label>
            <label className="settings-field">
              <span>Kota</span>
              <input
                id="settings-store-city"
                type="text"
                maxLength={60}
                value={form.storeCity}
                onChange={(event) => set("storeCity", event.target.value)}
              />
            </label>
            <label className="settings-field settings-span-2">
              <span>Alamat</span>
              <textarea
                id="settings-store-address"
                rows={3}
                maxLength={180}
                placeholder="Masukkan alamat restoran..."
                value={form.storeAddress}
                onChange={(event) => set("storeAddress", event.target.value)}
              />
            </label>
          </div>
        </SettingsCard>

        <SettingsCard
          icon="clock-3"
          title="Jam Operasional"
          subtitle="Dipakai sebagai acuan reservasi dan informasi pada website."
          delay={160}
        >
          <div className="settings-hours-list">
            {HOUR_ROWS.map((row) => (
              <div key={row.open} className="settings-hours-row">
                <div>
                  <strong>{row.title}</strong>
                  <small>{row.hint}</small>
                </div>
                <label>
                  <span>Buka</span>
                  <input
                    id={`settings-${row.open}`}
                    type="time"
                    value={form[row.open]}
                    onChange={(event) => set(row.open, event.target.value)}
                  />
                </label>
                <label>
                  <span>Tutup</span>
                  <input
                    id={`settings-${row.close}`}
                    type="time"
                    value={form[row.close]}
                    onChange={(event) => set(row.close, event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          icon="bell-ring"
          title="Notifikasi"
          subtitle="Pilih informasi yang ingin ditampilkan kepada admin."
          delay={190}
        >
          <div className="settings-toggle-list">
            {NOTIF_ROWS.map((row) => (
              <label key={row.key} className="settings-toggle-row">
                <div>
                  <strong>{row.title}</strong>
                  <small>{row.hint}</small>
                </div>
                <input
                  id={`settings-${row.key}`}
                  type="checkbox"
                  className="menu-native-switch"
                  checked={form[row.key]}
                  onChange={(event) => set(row.key, event.target.checked)}
                />
              </label>
            ))}
          </div>
        </SettingsCard>
      </section>

      <section className="reveal settings-note" style={{ animationDelay: "220ms" }}>
        <Icon name="database" className="u-size-4" />
        <div>
          <strong>Mode Prototype</strong>
          <span>
            Pengaturan disimpan pada browser menggunakan localStorage. Saat backend tersedia,
            bagian ini dapat langsung dihubungkan ke database dan konfigurasi website.
          </span>
        </div>
      </section>
    </AdminPage>
  );
}
