"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { SPICY_LABEL } from "@/data/kategori";
import { photoUrl } from "@/lib/format";
import { resizeImage } from "@/lib/image";
import type { Kategori, MenuItem } from "@/types";

interface KategoriEditorProps {
  initial: Kategori;
  menus: MenuItem[];
  onClose: () => void;
  onSave: (kategori: Kategori) => void;
  onDelete: (id: string) => void;
}

export function KategoriEditor({ initial, menus, onClose, onSave, onDelete }: KategoriEditorProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.desc);
  const [taste, setTaste] = useState(initial.taste);
  const [spicy, setSpicy] = useState(initial.spicy);
  const [menuId, setMenuId] = useState(initial.menuId);
  const [visible, setVisible] = useState(initial.visible);
  const [image, setImage] = useState(initial.image);
  const [uploading, setUploading] = useState(false);
  const isNew = !initial.id;

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Pilih file gambar JPG, PNG, atau WebP.");
    setUploading(true);
    try {
      setImage(await resizeImage(file, 480, 0.8));
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal membaca foto kategori.");
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!name.trim() || !desc.trim()) return toast("Nama kategori dan info singkat wajib diisi.");
    if (uploading) return toast("Foto masih diproses. Coba kembali sebentar.");
    const selectedMenu = menus.find((menu) => menu.id === menuId);
    onSave({
      ...initial,
      name: name.trim(),
      desc: desc.trim(),
      taste: taste.trim(),
      spicy,
      menuId: selectedMenu?.id || "",
      menuName: selectedMenu?.name || "",
      image,
      visible,
    });
  };

  return (
    <Drawer open onClose={onClose} eyebrow="KATEGORI LANDING PAGE" title={isNew ? "Tambah Kategori" : "Edit Kategori"}
      panelClassName="menu-editor-panel" bodyClassName="menu-editor-body"
      footer={
        <>
          {!isNew && <Button variant="secondary" icon="trash-2" onClick={() => {
            if (window.confirm(`Hapus kategori "${initial.name}"?`)) onDelete(initial.id);
          }}>Hapus</Button>}
          <Button variant="primary" icon="save" onClick={save} disabled={uploading}>{uploading ? "Memproses foto..." : "Simpan Kategori"}</Button>
        </>}
    >
      <div className="kat-photo">
        <div className="kat-photo-preview">
          {image ? <img src={photoUrl(image)} alt="Preview foto kategori" />
            : <span><Icon name="image" className="u-size-6" />Belum ada foto</span>}
        </div>
        <div className="kat-photo-actions">
          <label className="drawer-btn drawer-btn-secondary kat-upload d-flex align-items-center u-gap-2" style={{ cursor: "pointer" }}>
            <Icon name="upload" className="u-size-4" /> Pilih Foto
            <input id="kat-form-file" ref={fileRef} type="file" accept="image/*" hidden
              onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
          </label>
          {image && <button type="button" className="kat-link" onClick={() => { setImage(""); if (fileRef.current) fileRef.current.value = ""; }}>Hapus foto</button>}
        </div>
        <small className="kat-hint">Foto otomatis diperkecil agar muat di penyimpanan browser.</small>
      </div>
      <label className="menu-field"><span>Nama Kategori *</span>
        <input id="kat-form-name" type="text" maxLength={30} placeholder="Contoh: Sate Padang" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="menu-field"><span>Info Singkat *</span>
        <textarea id="kat-form-desc" rows={3} maxLength={140} placeholder="1–2 kalimat tentang makanan ini" value={desc} onChange={(event) => setDesc(event.target.value)} />
        <small>{desc.length}/140 karakter</small>
      </label>
      <div className="menu-form-row">
        <label className="menu-field"><span>Rasa</span>
          <input id="kat-form-taste" type="text" maxLength={40} placeholder="Contoh: Gurih, Pedas" value={taste} onChange={(event) => setTaste(event.target.value)} />
        </label>
        <label className="menu-field"><span>Level Pedas</span>
          <Select id="kat-form-spicy" value={String(spicy)} onChange={(v) => setSpicy(Number(v))}
            options={SPICY_LABEL.map((label, index) => ({ value: String(index), label }))} />
        </label>
      </div>
      <label className="menu-field"><span>Menu Terkait (untuk harga & tombol Pesan)</span>
        <Select id="kat-form-menu" value={menuId} onChange={setMenuId}
          options={[{ value: "", label: "— Tidak ada —" }, ...menus.map((item) => ({ value: item.id, label: item.name }))]} />
      </label>
      <div className="menu-editor-switches">
        <label className="menu-setting-row"><div><strong>Tampil di Website</strong><small>Munculkan kategori ini di Landing Page.</small></div>
          <input id="kat-form-visible" type="checkbox" className="menu-native-switch" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
        </label>
      </div>
    </Drawer>
  );
}
