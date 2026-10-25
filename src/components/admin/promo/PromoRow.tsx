import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx, photoUrl } from "@/lib/format";
import { promoDate, promoImage, type PromoStatus } from "@/lib/promo";
import type { Promo } from "@/types";

const STATUS_CLASS: Record<PromoStatus, string> = {
  Aktif: "active",
  Terjadwal: "scheduled",
  Nonaktif: "off",
};

interface PromoRowProps {
  promo: Promo;
  status: PromoStatus;
  onEdit: () => void;
  onToggleWebsite: () => void;
}

/** Satu baris di "Daftar Promo". */
export function PromoRow({ promo, status, onEdit, onToggleWebsite }: PromoRowProps) {
  const image = promoImage(promo);
  const thumbStyle = image
    ? ({ "--menu-photo": `url('${photoUrl(image)}')` } as CSSProperties)
    : undefined;

  return (
    <div className="promo-row" data-promo-id={promo.id}>
      <div className="promo-row-main">
        <span className={cx("promo-row-thumb", image && "has-photo")} style={thumbStyle} />
        <div>
          <p className="promo-row-title">{promo.name}</p>
          <p className="promo-row-desc">{promo.desc || "Tidak ada deskripsi."}</p>
        </div>
      </div>
      <div>
        <p className="promo-meta-label">Tipe</p>
        <p className="promo-meta-value">{promo.type}</p>
      </div>
      <div>
        <p className="promo-meta-label">Periode</p>
        <p className="promo-meta-value">
          {promoDate(promo.start)} – {promoDate(promo.end)}
        </p>
      </div>
      <div>
        <span className="promo-value-pill">{promo.value || "—"}</span>
        <div style={{ marginTop: 7 }}>
          <span className={cx("promo-status", STATUS_CLASS[status])}>{status}</span>
        </div>
      </div>
      <div className="promo-website-wrap">
        <button
          type="button"
          className={cx("mini-switch", promo.website && "is-on")}
          role="switch"
          aria-checked={promo.website}
          aria-label={`Tampilkan ${promo.name} di website`}
          onClick={onToggleWebsite}
        >
          <span />
        </button>
        <small>Website</small>
      </div>
      <button type="button" className="promo-edit-btn" aria-label="Edit promo" onClick={onEdit}>
        <Icon name="pencil" className="u-size-4" />
      </button>
    </div>
  );
}
