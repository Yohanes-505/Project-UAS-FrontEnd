"use client";

import { KATEGORI_DEFAULT, SPICY_LABEL } from "@/data/kategori";
import { MENU_DATA_DEFAULT } from "@/data/menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { photoUrl, rupiah } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import { useLanding } from "./context";
import { LandingModal } from "./LandingModal";

/** Pop up info sebuah kategori. Harga dan tombol pesan hanya muncul kalau kategori terhubung ke menu yang tersedia. */
export function KategoriModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [kategori] = useLocalStorage(STORAGE_KEYS.kategori, KATEGORI_DEFAULT);
  const [menu] = useLocalStorage(STORAGE_KEYS.menu, MENU_DATA_DEFAULT);
  const { openOrder } = useLanding();

  const k = kategori.find((x) => x.id === id);
  const linked = k && menu.find((m) => m.id === k.menuId || (k.menuName && m.name === k.menuName));
  const canOrder = !!linked && linked.website && linked.available && linked.stock > 0;
  const photo = k ? photoUrl(k.image) : "";
  const tags = k ? k.taste.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <LandingModal open={!!k} onClose={onClose} labelledBy="kategoriTitle" className="kategori-modal" panelClassName="kategori-modal-panel">
      {k && (
        <>
          <div
            className={photo ? "kategori-modal-photo" : "kategori-modal-photo no-photo"}
            style={photo ? { backgroundImage: `url("${photo}")` } : undefined}
          >
            <button type="button" className="order-modal-close kategori-modal-close" aria-label="Tutup" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="kategori-modal-body">
            <h2 className="order-modal-title" id="kategoriTitle">
              {k.name}
            </h2>
            <div className="kategori-modal-tags">
              {tags.map((t) => (
                <span className="kategori-tag" key={t}>
                  {t}
                </span>
              ))}
              <span className="kategori-tag kategori-tag-spicy">{SPICY_LABEL[k.spicy] ?? SPICY_LABEL[0]}</span>
            </div>
            <p className="kategori-modal-desc">{k.desc}</p>
            <div className="kategori-modal-footer">
              {canOrder && linked && (
                <div className="kategori-modal-price">
                  <small>{linked.name}</small>
                  <strong>{rupiah(linked.price)}</strong>
                </div>
              )}
              {canOrder && linked ? (
                <button
                  type="button"
                  className="btn-solid-red"
                  onClick={() => {
                    onClose();
                    openOrder({ menuId: linked.id });
                  }}
                >
                  Pesan Sekarang
                </button>
              ) : (
                <a className="btn-solid-red" href="#menu" onClick={onClose}>
                  Lihat Menu
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </LandingModal>
  );
}