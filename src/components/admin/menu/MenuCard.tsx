import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { menuImage } from "@/data/menu";
import { cx, photoUrl, rupiah } from "@/lib/format";
import { menuStockLabel } from "@/lib/menu";
import type { MenuItem } from "@/types";

interface MenuCardProps {
  menu: MenuItem;
  onEdit: () => void;
  onToggleAvailable: () => void;
  onToggleWebsite: () => void;
}

export function MenuCard({ menu, onEdit, onToggleAvailable, onToggleWebsite }: MenuCardProps) {
  const image = menuImage(menu);
  const stock = menuStockLabel(menu);
  const style = image ? ({ "--menu-photo": `url('${photoUrl(image)}')` } as CSSProperties) : undefined;
  const initials = menu.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <article className="menu-admin-card" data-menu-id={menu.id}>
      <div className={cx("menu-admin-photo", `menu-tone-${menu.tone || "rendang"}`, image && "has-photo")} style={style}>
        {!image && <span className="menu-admin-photo-mark">{initials}</span>}
        {menu.featured && <span className="menu-featured-badge"><Icon name="star" className="u-size-3" /> Andalan</span>}
        <button type="button" className="menu-card-more" aria-label={`Edit ${menu.name}`} onClick={onEdit}>
          <Icon name="more-horizontal" className="u-size-4" />
        </button>
      </div>
      <div className="menu-admin-body">
        <div className="d-flex align-items-start justify-content-between u-gap-3">
          <div className="u-min-w-0">
            <p className="menu-admin-name" title={menu.name}>{menu.name}</p>
            <p className="menu-admin-category">{menu.category}</p>
          </div>
          <p className="menu-admin-price">{rupiah(menu.price)}</p>
        </div>
        <p className="menu-admin-desc">{menu.desc || "Belum ada deskripsi menu."}</p>
        <div className="d-flex align-items-center justify-content-between u-gap-2" style={{ marginTop: "auto" }}>
          <span className={cx("menu-stock-badge", stock.className)}>{stock.label}</span>
          <button type="button" className="menu-edit-link" onClick={onEdit}>Edit menu</button>
        </div>
      </div>
      <div className="menu-admin-footer">
        <div>
          <p>Tersedia</p>
          <button type="button" className={cx("mini-switch", menu.available && "is-on")} role="switch"
            aria-checked={menu.available} aria-label={`Ketersediaan ${menu.name}`} onClick={onToggleAvailable}><span /></button>
        </div>
        <div>
          <p>Website</p>
          <button type="button" className={cx("mini-switch", menu.website && "is-on")} role="switch"
            aria-checked={menu.website} aria-label={`Tampilkan ${menu.name} di website`} onClick={onToggleWebsite}><span /></button>
        </div>
      </div>
    </article>
  );
}
