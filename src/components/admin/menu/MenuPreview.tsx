"use client";

import type { CSSProperties } from "react";
import { CloseButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { menuImage } from "@/data/menu";
import { cx, photoUrl, rupiah } from "@/lib/format";
import { websiteFeaturedMenus } from "@/lib/menu";
import type { MenuItem } from "@/types";

interface MenuPreviewProps {
  open: boolean;
  onClose: () => void;
  menus: MenuItem[];
}

export function MenuPreview({ open, onClose, menus }: MenuPreviewProps) {
  const items = websiteFeaturedMenus(menus);
  return (
    <Modal open={open} onClose={onClose} labelledBy="menu-preview-title"
      overlayClassName="menu-preview-overlay position-fixed u-inset-0 u-z-60 d-flex">
      <section className="menu-preview-modal anim-pop" onClick={(event) => event.stopPropagation()}>
        <div className="menu-preview-head">
          <div><p className="u-text-xs fw-medium u-tracking-0-24px ink60">PREVIEW WEBSITE</p>
            <p id="menu-preview-title" className="u-text-base fw-semibold u-text-ink">Menu Andalan Kami</p></div>
          <CloseButton label="Tutup preview" onClick={onClose} />
        </div>
        <div className="website-preview-canvas">
          <p className="website-preview-eyebrow">• MENU KAMI</p>
          <div className="d-flex flex-wrap align-items-end justify-content-between u-gap-3">
            <div><h2>MENU ANDALAN KAMI</h2><p>Resep turun-temurun, dimasak setiap pagi dengan rempah pilihan.</p></div>
            <span>Lihat Semua Menu</span>
          </div>
          <div className="website-preview-grid">
            {items.length === 0 ? (
              <div className="website-preview-empty">Belum ada Menu Andalan yang dipublikasikan di website.</div>
            ) : items.map((menu) => {
              const image = menuImage(menu);
              const style = image ? ({ "--menu-photo": `url('${photoUrl(image)}')` } as CSSProperties) : undefined;
              return (
                <div key={menu.id} className="website-preview-card">
                  <div className={cx("website-preview-photo", `menu-tone-${menu.tone || "rendang"}`, image && "has-photo")} style={style}>
                    {!image && <span>FOTO</span>}
                  </div>
                  <div className="website-preview-body">
                    <div className="d-flex align-items-start justify-content-between u-gap-2">
                      <strong>{menu.name.toUpperCase()}</strong><b>{rupiah(menu.price)}</b>
                    </div>
                    <p>{menu.desc}</p>
                    <span className="align-self-start rounded-pill u-bg-maroon u-px-3 u-py-1 text-white u-text-xs">Pesan</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="u-text-xs" style={{ marginTop: 16, opacity: .7 }}>Preview tampilan saja; tombol Pesan tersedia pada Landing Page.</p>
        </div>
      </section>
    </Modal>
  );
}
