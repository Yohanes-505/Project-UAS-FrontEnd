"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { cx, photoUrl } from "@/lib/format";
import { PHOTO_OPTIONS, resizeImage } from "@/lib/image";
import { PROMO_TYPES, promoImage } from "@/lib/promo";
import type { Promo } from "@/types";

const DESC_MAX = 180;
const PHOTO_CHOICES = [
  { value: "", label: "Tanpa foto" },
  { value: "upload", label: "Foto dari komputer (upload)" },
  ...PHOTO_OPTIONS,
];

interface PromoEditorProps {
  /** Promo yang diedit. Untuk promo baru, kirim promo kosong dengan id "". */
  initial: Promo;
  onClose: () => void;
  onSave: (promo: Promo) => void;
  onDelete: (id: string) => void;
}

/**
 * Panel editor promo (geser dari kanan). Pasang dengan `key` supaya setiap
 * membuka promo berbeda, isi form dimulai dari awal.
 */
export function PromoEditor({ initial, onClose, onSave, onDelete }: PromoEditorProps) {
  const showToast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !initial.id;

  const [name, setName] = useState(initial.name);
  const [type, setType] = useState(initial.type);
  const [value, setValue] = useState(initial.value);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [desc, setDesc] = useState(initial.desc);
  const [active, setActive] = useState(initial.active);
  const [website, setWebsite] = useState(initial.website);
  const [image, setImage] = useState(promoImage(initial));
  // Foto upload terakhir, supaya bisa dipilih lagi tanpa upload ulang.
  const [uploaded, setUploaded] = useState(promoImage(initial).startsWith("data:") ? promoImage(initial) : "");

  const choice = image.startsWith("data:") ? "upload" : image;

  const handleChoice = (next: string) => {
    if (next === "upload") {
      if (uploaded) setImage(uploaded);
      else fileRef.current?.click();
      return;
    }
    setImage(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Pilih file gambar (JPG/PNG/WebP).");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setUploaded(dataUrl);
      setImage(dataUrl);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal memproses gambar.");
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !start || !end) {
      showToast("Nama promo dan periode wajib diisi.");
      return;
    }
    if (end < start) {
      showToast("Tanggal berakhir tidak boleh sebelum tanggal mulai.");
      return;
    }
    onSave({
      ...initial,
      name: trimmedName,
      type,
      value: value.trim(),
      start,
      end,
      desc: desc.trim(),
      active,
      website,
      image,
    });
  };

  const previewStyle: CSSProperties | undefined = image
    ? { backgroundImage: `url('${photoUrl(image)}')` }
    : undefined;

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="PROMO"
      title={isNew ? "Tambah Promo" : "Edit Promo"}
      panelClassName="menu-editor-panel"
      bodyClassName="menu-editor-body"
      closeLabel="Tutup form"
      footer={
        <>
          {!isNew && (
            <Button variant="secondary" onClick={() => onDelete(initial.id)}>
              Hapus
            </Button>
          )}
          <Button variant="primary" icon="save" onClick={handleSave}>
            Simpan Promo
          </Button>
        </>
      }
    >
      <div className="menu-photo-picker">
        <div
          id="promo-photo-preview"
          className={cx("menu-photo-preview promo-photo-preview", image && "has-photo")}
          style={previewStyle}
        >
          {!image && (
            <div className="menu-photo-placeholder">
              <Icon name="image" className="u-size-6" />
              <span>Belum ada foto</span>
            </div>
          )}
        </div>
        <label className="menu-field">
          <span>Foto Promo</span>
          <Select id="promo-form-image" value={choice} onChange={handleChoice} options={PHOTO_CHOICES} />
        </label>
        <label className="menu-photo-upload-btn">
          <Icon name="upload" className="u-size-4" /> Upload dari komputer
          <input
            ref={fileRef}
            id="promo-form-file"
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        <small className="menu-photo-hint">Foto tampil di lingkaran kartu promo pada landing page.</small>
      </div>

      <label className="menu-field">
        <span>Nama Promo</span>
        <input
          id="promo-form-name"
          type="text"
          placeholder="Contoh: Paket Hemat Nasi Rendang"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Tipe Promo</span>
          <Select id="promo-form-type" value={type} onChange={setType} options={PROMO_TYPES} />
        </label>
        <label className="menu-field">
          <span>Nilai Promo</span>
          <input
            id="promo-form-value"
            type="text"
            placeholder="Contoh: 20% atau Rp10.000"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
      </div>

      <div className="menu-form-row">
        <label className="menu-field">
          <span>Mulai</span>
          <input id="promo-form-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </label>
        <label className="menu-field">
          <span>Berakhir</span>
          <input id="promo-form-end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </label>
      </div>

      <label className="menu-field">
        <span>Deskripsi Singkat</span>
        <textarea
          id="promo-form-desc"
          rows={4}
          maxLength={DESC_MAX}
          placeholder="Keterangan yang tampil di website..."
          value={desc}
          onChange={(event) => setDesc(event.target.value)}
        />
        <small>
          <span id="promo-desc-count">{desc.length}</span>/{DESC_MAX} karakter
        </small>
      </label>

      <div className="menu-editor-switches">
        <label className="menu-setting-row">
          <div>
            <strong>Promo Aktif</strong>
            <small>Promo dapat digunakan pelanggan.</small>
          </div>
          <input
            id="promo-form-active"
            type="checkbox"
            className="menu-native-switch"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
        </label>
        <label className="menu-setting-row">
          <div>
            <strong>Tampil di Website</strong>
            <small>Tampilkan promo pada landing page.</small>
          </div>
          <input
            id="promo-form-website"
            type="checkbox"
            className="menu-native-switch"
            checked={website}
            onChange={(event) => setWebsite(event.target.checked)}
          />
        </label>
      </div>
    </Drawer>
  );
}
