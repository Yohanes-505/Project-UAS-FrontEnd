"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { SPICY_LABEL } from "@/data/kategori";
import { useApiList } from "@/hooks/useApiList";
import { apiSend, errorMessage, notifyApiChange } from "@/lib/api";
import { cx, photoUrl } from "@/lib/format";
import type { Kategori, MenuItem } from "@/types";
import { KategoriEditor } from "./KategoriEditor";

interface KategoriManagerProps { menus: MenuItem[] }

export function KategoriManager({ menus }: KategoriManagerProps) {
  const toast = useToast();
  const { items: kategori, create, update, remove: removeKategori } = useApiList<Kategori>("/api/kategori");
  const [editing, setEditing] = useState<Kategori | null>(null);
  const add = () => setEditing({ id: "", name: "", desc: "", taste: "", spicy: 0, menuId: "", menuName: "", image: "", visible: true });
  const save = async (item: Kategori) => {
    const newItem = !item.id;
    try {
      if (newItem) await create(item); else await update(item.id, item);
      toast(newItem ? "Kategori baru berhasil ditambahkan." : "Kategori berhasil diperbarui.");
      setEditing(null);
    } catch (err) {
      toast(errorMessage(err, "Kategori gagal disimpan."));
    }
  };
  const remove = async (id: string) => {
    try {
      await removeKategori(id);
      toast("Kategori dihapus.");
      setEditing(null);
    } catch (err) {
      toast(errorMessage(err, "Kategori gagal dihapus."));
    }
  };
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= kategori.length) return;
    const ids = kategori.map((item) => item.id);
    const [id] = ids.splice(index, 1);
    ids.splice(target, 0, id);
    try {
      await apiSend("PUT", "/api/kategori/order", { ids });
      notifyApiChange("/api/kategori");
      toast("Urutan kategori diperbarui.");
    } catch (err) {
      toast(errorMessage(err, "Urutan kategori gagal disimpan."));
    }
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
