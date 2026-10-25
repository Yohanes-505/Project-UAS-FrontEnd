"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { KATEGORI_DEFAULT, SPICY_LABEL } from "@/data/kategori";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cx, photoUrl } from "@/lib/format";
import { nextKategoriId } from "@/lib/menu";
import { STORAGE_KEYS, seedStorage, writeStorage } from "@/lib/storage";
import type { Kategori, MenuItem } from "@/types";
import { KategoriEditor } from "./KategoriEditor";

interface KategoriManagerProps { menus: MenuItem[] }

export function KategoriManager({ menus }: KategoriManagerProps) {
  const toast = useToast();
  const [stored, , ready] = useLocalStorage<Kategori[]>(STORAGE_KEYS.kategori, KATEGORI_DEFAULT);
  const [editing, setEditing] = useState<Kategori | null>(null);
  const kategori = Array.isArray(stored) ? stored : KATEGORI_DEFAULT;

  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.kategori, KATEGORI_DEFAULT); }, [ready]);

  const persist = (next: Kategori[]): boolean => {
    if (writeStorage(STORAGE_KEYS.kategori, next)) return true;
    toast("Kategori gagal disimpan: penyimpanan browser penuh. Coba gunakan foto lebih kecil.");
    return false;
  };
  const add = () => setEditing({ id: "", name: "", desc: "", taste: "", spicy: 0, menuId: "", menuName: "", image: "", visible: true });
  const save = (item: Kategori) => {
    const newItem = !item.id;
    const next = newItem ? [...kategori, { ...item, id: nextKategoriId(kategori) }]
      : kategori.map((previous) => previous.id === item.id ? item : previous);
    if (!persist(next)) return;
    toast(newItem ? "Kategori baru berhasil ditambahkan." : "Kategori berhasil diperbarui.");
    setEditing(null);
  };
  const remove = (id: string) => {
    if (!persist(kategori.filter((item) => item.id !== id))) return;
    toast("Kategori dihapus.");
    setEditing(null);
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= kategori.length) return;
    const next = [...kategori];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    if (persist(next)) toast("Urutan kategori diperbarui.");
  };

  return (
    <section id="kategori-manager" className="reveal menu-manager-shell kat-shell" style={{ animationDelay: "240ms" }}>
      <div className="kat-head">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Kategori Landing Page</p>
          <p className="u-text-sm ink60">Atur kategori pada bagian “Pilih Lauk Favoritmu” beserta informasi yang muncul saat diklik.</p>
        </div>
        <Button id="kat-add" variant="pill" icon="plus" onClick={add}>Tambah Kategori</Button>
      </div>
      <div id="kat-list" className="kat-list">
        {kategori.length === 0 && <div className="kat-empty">Belum ada kategori. Klik “Tambah Kategori” untuk menambahkan.</div>}
        {kategori.map((item, index) => {
          const linked = menus.find((menu) => menu.id === item.menuId);
          return (
            <article key={item.id} className={cx("kat-row", !item.visible && "is-hidden")} data-kat-id={item.id}>
              <div className="kat-thumb">
                {item.image ? <img src={photoUrl(item.image)} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}
              </div>
              <div className="kat-info">
                <p className="kat-name">{item.name}{!item.visible && <em>Disembunyikan</em>}</p>
                <p className="kat-desc" title={item.desc}>{item.desc}</p>
                <div className="kat-chips">
                  <span>{SPICY_LABEL[item.spicy] ?? SPICY_LABEL[0]}</span>
                  {item.taste && <span>{item.taste}</span>}
                  <span className={!linked ? "is-muted" : ""}>
                    {linked ? `Menu: ${linked.name}` : item.menuId ? "Menu terkait tidak ditemukan" : "Tanpa menu terkait"}
                  </span>
                </div>
              </div>
              <div className="kat-actions">
                <button type="button" className="kat-icon-btn" disabled={index === 0}
                  aria-label={`Naikkan urutan ${item.name}`} onClick={() => move(index, -1)}>
                  <Icon name="arrow-up" className="u-size-4" />
                </button>
                <button type="button" className="kat-icon-btn" disabled={index === kategori.length - 1}
                  aria-label={`Turunkan urutan ${item.name}`} onClick={() => move(index, 1)}>
                  <Icon name="arrow-down" className="u-size-4" />
                </button>
                <button type="button" className="kat-icon-btn" aria-label={`Edit kategori ${item.name}`}
                  onClick={() => setEditing(item)}><Icon name="pencil" className="u-size-4" /></button>
              </div>
            </article>
          );
        })}
      </div>
      {editing && <KategoriEditor key={editing.id || "new"} initial={editing} menus={menus}
        onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
    </section>
  );
}
