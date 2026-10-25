"use client";

import { useEffect, useState } from "react";
import { AdminPage, PageHeading } from "@/components/admin/AdminPage";
import { KategoriManager } from "@/components/admin/menu/KategoriManager";
import { MenuCard } from "@/components/admin/menu/MenuCard";
import { MenuEditor } from "@/components/admin/menu/MenuEditor";
import { MenuPreview } from "@/components/admin/menu/MenuPreview";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Icon } from "@/components/ui/Icon";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { MENU_DATA_DEFAULT } from "@/data/menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LOW_STOCK_LIMIT, MAX_FEATURED_MENU, MENU_CATEGORIES, nextMenuId } from "@/lib/menu";
import { STORAGE_KEYS, seedStorage, writeStorage } from "@/lib/storage";
import type { MenuItem } from "@/types";

export default function MenuPage() {
  const toast = useToast();
  const [stored, , ready] = useLocalStorage<MenuItem[]>(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
  const menus = Array.isArray(stored) ? stored : MENU_DATA_DEFAULT;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => { if (ready) seedStorage(STORAGE_KEYS.menu, MENU_DATA_DEFAULT); }, [ready]);

  const persist = (next: MenuItem[]): boolean => {
    if (writeStorage(STORAGE_KEYS.menu, next)) return true;
    toast("Gagal menyimpan: penyimpanan browser penuh. Coba gunakan foto bawaan atau hapus foto upload.");
    return false;
  };
  const openNew = () => setEditing({
    id: "", name: "", category: "Daging", price: 0, stock: 0,
    available: true, website: true, featured: false, tone: "rendang", desc: "", image: "",
  });
  const save = (item: MenuItem) => {
    const isNew = !item.id;
    const others = menus.filter((menu) => menu.featured && menu.id !== item.id);
    if (item.featured && others.length >= MAX_FEATURED_MENU) {
      toast(`Menu Andalan maksimal ${MAX_FEATURED_MENU}. Matikan dulu salah satu: ${others.map((menu) => menu.name).join(", ")}.`);
      return;
    }
    const next = isNew ? [...menus, { ...item, id: nextMenuId(menus) }]
      : menus.map((menu) => menu.id === item.id ? item : menu);
    if (!persist(next)) return;
    toast(isNew ? `${item.name} berhasil ditambahkan.` : `${item.name} berhasil diperbarui.`);
    setEditing(null);
  };
  const remove = (id: string) => {
    if (!persist(menus.filter((item) => item.id !== id))) return;
    toast("Menu dihapus dari katalog admin.");
    setEditing(null);
  };
  const toggle = (id: string, field: "available" | "website") => {
    const target = menus.find((item) => item.id === id);
    if (!target) return;
    const next = menus.map((item) => item.id === id ? { ...item, [field]: !item[field] } : item);
    if (persist(next)) toast(`${target.name}: ${field === "website" ? "tampilan website" : "ketersediaan"} ${target[field] ? "dinonaktifkan" : "diaktifkan"}.`);
  };

  const categories = ["Semua", ...new Set([...MENU_CATEGORIES, ...menus.map((menu) => menu.category)])];
  const query = search.trim().toLocaleLowerCase("id-ID");
  const visible = menus.filter((menu) => (category === "Semua" || menu.category === category)
    && (!query || [menu.name, menu.category, menu.desc].join(" ").toLocaleLowerCase("id-ID").includes(query)));

  return (
    <AdminPage id="page-menu">
      <PageHeading title="Kelola Menu Makanan"
        badge={<span className="website-sync-pill"><span className="website-sync-dot" />Terhubung ke Website</span>}
        subtitle="Atur harga, stok, ketersediaan, dan menu yang tampil pada website Lamak Bana."
        actions={<>
          <Button id="btn-preview-menu" variant="pill-outline" icon="monitor" onClick={() => setPreviewOpen(true)}>Preview Website</Button>
          <Button id="btn-add-menu" variant="pill" icon="plus" onClick={openNew}>Tambah Menu</Button>
        </>}
      />

      <div className="menu-stat-grid">
        <StatCard variant="menu" icon="utensils" iconClassName="menu-stat-maroon" label="Total Menu" value={menus.length} delay={80} />
        <StatCard variant="menu" icon="globe-2" iconClassName="menu-stat-green" label="Tampil di Website" value={menus.filter((item) => item.website).length} delay={110} />
        <StatCard variant="menu" icon="triangle-alert" iconClassName="menu-stat-amber" label="Stok Menipis"
          value={menus.filter((item) => item.available && item.stock > 0 && item.stock <= LOW_STOCK_LIMIT).length} delay={140} />
        <StatCard variant="menu" icon="star" iconClassName="menu-stat-soft" label="Menu Andalan" value={menus.filter((item) => item.featured).length} delay={170} />
      </div>

      <section className="reveal menu-manager-shell" style={{ animationDelay: "210ms" }}>
        <div className="d-flex w-100 flex-wrap align-items-center justify-content-between u-gap-3">
          <div className="menu-search-wrap">
            <Icon name="search" className="u-size-4 ink60" />
            <input id="menu-search" className="menu-search-input" type="search" placeholder="Cari nama menu..."
              autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="d-flex flex-wrap align-items-center u-gap-2">
            <FilterDropdown id="menu-category" value={category} onChange={setCategory} options={categories}
              formatLabel={(value) => value === "Semua" ? "Semua Kategori" : value}
              align="right" className="menu-filter-dropdown" ariaLabel="Filter kategori menu" />
            <button id="menu-reset" type="button"
              className="filter-pill d-flex align-items-center u-gap-2 rounded-pill u-border u-border-solid border-soft bg-white u-px-3 u-py-2 u-text-sm u-text-ink"
              onClick={() => { setSearch(""); setCategory("Semua"); }}><Icon name="rotate-ccw" className="u-size-4" /> Reset</button>
          </div>
        </div>
        <div className="menu-page-note"><Icon name="info" className="u-size-4" />
          <div><strong>Sinkronisasi website</strong>
            <span>Menu dengan toggle “Website” aktif tersedia untuk Landing Page. Menu bertanda “Andalan” dapat tampil pada section Menu Andalan.</span>
          </div>
        </div>
        <div id="menu-catalog" className="menu-card-grid">
          {visible.map((menu) => <MenuCard key={menu.id} menu={menu} onEdit={() => setEditing(menu)}
            onToggleAvailable={() => toggle(menu.id, "available")} onToggleWebsite={() => toggle(menu.id, "website")} />)}
        </div>
        {visible.length === 0 && <div id="menu-empty" className="menu-empty"><Icon name="search-x" className="u-size-5" />
          <p className="u-text-sm fw-medium u-text-ink">Menu tidak ditemukan</p><p className="u-text-xs ink60">Coba ubah pencarian atau kategori.</p>
        </div>}
      </section>

      <KategoriManager menus={menus} />
      {editing && <MenuEditor key={editing.id || "new"} initial={editing} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
      <MenuPreview open={previewOpen} onClose={() => setPreviewOpen(false)} menus={menus} />
    </AdminPage>
  );
}
