"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { menuImage } from "@/data/menu";
import { cx, photoUrl } from "@/lib/format";
import { PHOTO_OPTIONS, resizeImage } from "@/lib/image";
import { MENU_CATEGORIES } from "@/lib/menu";
import type { MenuItem } from "@/types";

interface MenuEditorProps {
  initial: MenuItem;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

const PHOTO_CHOICES = [
  { value: "", label: "Tanpa foto" },
  { value: "upload", label: "Foto dari komputer (upload)" },
  ...PHOTO_OPTIONS,
];

export function MenuEditor({ initial, onClose, onSave, onDelete }: MenuEditorProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [stock, setStock] = useState(String(initial.stock));
  const [available, setAvailable] = useState(initial.available);
  const [website, setWebsite] = useState(initial.website);
  const [featured, setFeatured] = useState(initial.featured);
  const [desc, setDesc] = useState(initial.desc);
  const [image, setImage] = useState(menuImage(initial));
  const [uploaded, setUploaded] = useState(menuImage(initial).startsWith("data:") ? menuImage(initial) : "");
  const [uploading, setUploading] = useState(false);
  const isNew = !initial.id;

  const choice = image.startsWith("data:") ? "upload" : image;
  const selectImage = (value: string) => {
    if (value === "upload") {
      if (uploaded) setImage(uploaded);
      else fileRef.current?.click();
    } else setImage(value);
  };
  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Pilih file gambar JPG, PNG, atau WebP.");
    setUploading(true);
    try {
      const next = await resizeImage(file);
      setUploaded(next);
      setImage(next);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal memproses gambar.");
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    const cleanName = name.trim();
    const amount = Number(price);
    const quantity = Number(stock);
    if (!cleanName || !Number.isFinite(amount) || amount <= 0) return toast("Nama menu dan harga lebih dari Rp0 wajib diisi.");
    if (!Number.isInteger(quantity) || quantity < 0) return toast("Stok harus berupa bilangan bulat 0 atau lebih.");
    if (uploading) return toast("Foto masih diproses. Coba simpan kembali.");
    onSave({
      ...initial,
      name: cleanName,
      category,
      price: amount,
      stock: quantity,
      available,
      website,
      featured,
      desc: desc.trim(),
      image,
      tone: initial.tone || "rendang",
    });
  };
  const previewStyle: CSSProperties | undefined = image ? { backgroundImage: `url('${photoUrl(image)}')` } : undefined;

  return (
    <Drawer open onClose={onClose} eyebrow="MENU MAKANAN" title={isNew ? "Tambah Menu" : "Edit Menu"}
      panelClassName="menu-editor-panel" bodyClassName="menu-editor-body"
      footer={
        <>
          {!isNew && <Button variant="secondary" icon="trash-2" onClick={() => {
            if (window.confirm(`Hapus menu "${initial.name}" dari katalog?`)) onDelete(initial.id);
          }}>Hapus</Button>}
          <Button variant="primary" icon="save" onClick={save} disabled={uploading}>{uploading ? "Memproses foto..." : "Simpan Perubahan"}</Button>
        </>
      }
    >
      <div className="menu-photo-picker">
        <div className={cx("menu-photo-preview", image && "has-photo")} style={previewStyle}>
          {!image && <div className="menu-photo-placeholder"><Icon name="image" className="u-size-6" /><span>Belum ada foto</span></div>}
        </div>
        <label className="menu-field"><span>Foto Menu</span>
          <Select id="menu-form-image" value={choice} onChange={selectImage} options={PHOTO_CHOICES} />
        </label>
        <label className="menu-photo-upload-btn"><Icon name="upload" className="u-size-4" /> Upload dari komputer
          <input ref={fileRef} id="menu-form-file" type="file" accept="image/*" hidden
            onChange={(event) => { void handleUpload(event.target.files?.[0]); event.target.value = ""; }} />
        </label>
        <small className="menu-photo-hint">Foto upload otomatis diperkecil dan disimpan di browser ini. Atau pilih foto bawaan di atas.</small>
      </div>
      <label className="menu-field"><span>Nama Menu *</span>
        <input id="menu-form-name" type="text" maxLength={90} placeholder="Contoh: Rendang Daging" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <div className="menu-form-row">
        <label className="menu-field"><span>Kategori</span>
          <Select id="menu-form-category" value={category} onChange={setCategory} options={MENU_CATEGORIES.includes(category) ? MENU_CATEGORIES : [...MENU_CATEGORIES, category]} />
        </label>
        <label className="menu-field"><span>Harga *</span><span className="menu-price-input"><b>Rp</b>
          <input id="menu-form-price" type="number" min="1" step="1000" value={price} onChange={(event) => setPrice(event.target.value)} />
        </span></label>
      </div>
      <div className="menu-form-row">
        <label className="menu-field"><span>Stok Hari Ini</span>
          <input id="menu-form-stock" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} />
        </label>
        <label className="menu-field"><span>Status</span>
          <Select id="menu-form-available" value={String(available)}
            onChange={(value) => setAvailable(value === "true")}
            options={[{ value: "true", label: "Tersedia" }, { value: "false", label: "Tidak Tersedia" }]} />
        </label>
      </div>
      <label className="menu-field"><span>Deskripsi Website</span>
        <textarea id="menu-form-desc" rows={4} maxLength={150} placeholder="Deskripsi singkat menu..." value={desc} onChange={(event) => setDesc(event.target.value)} />
        <small>{desc.length}/150 karakter</small>
      </label>
      <div className="menu-editor-switches">
        <label className="menu-setting-row"><div><strong>Tampil di Website</strong><small>Publikasikan menu pada halaman website.</small></div>
          <input id="menu-form-website" type="checkbox" className="menu-native-switch" checked={website} onChange={(event) => setWebsite(event.target.checked)} />
        </label>
        <label className="menu-setting-row"><div><strong>Menu Andalan</strong><small>Maksimal tiga menu pada section Menu Andalan.</small></div>
          <input id="menu-form-featured" type="checkbox" className="menu-native-switch" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
        </label>
      </div>
    </Drawer>
  );
}
