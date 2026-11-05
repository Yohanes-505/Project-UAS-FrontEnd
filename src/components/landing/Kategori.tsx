"use client";

import { KATEGORI_DEFAULT } from "@/data/kategori";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cx, photoUrl } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/storage";
import { useLanding } from "./context";

/** Kartu kategori. Isinya diatur admin lewat halaman Menu (kategori landing page). */
export function Kategori() {
  const [all] = useLocalStorage(STORAGE_KEYS.kategori, KATEGORI_DEFAULT);
  const { openKategori, activeKategori } = useLanding();
  const list = all.filter((k) => k.visible);

  return (
    <section className="kategori" id="kategori">
      <div className="kategori-header reveal">
        <p className="kategori-subtitle">KATEGORI</p>
        <h2 className="kategori-title text-black">PILIH SELERAMU</h2>
        <p className="kategori-desc">Ketuk salah satu untuk tahu rasa dan tingkat pedasnya.</p>
      </div>

      <div className="kategori-list">
        {list.length === 0 && <p className="kategori-empty">Kategori sedang disiapkan.</p>}
        {list.map((k) => {
          const photo = photoUrl(k.image);
          return (
            <button
              type="button"
              key={k.id}
              className={cx("kategori-item", activeKategori === k.id && "active")}
              onClick={() => openKategori(k.id)}
              aria-haspopup="dialog"
            >
              <span
                className={cx("kategori-box", !photo && "kategori-box-initial")}
                style={photo ? { backgroundImage: `url("${photo}")` } : undefined}
              >
                {!photo && k.name.charAt(0).toUpperCase()}
              </span>
              <span className="kategori-name">{k.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}