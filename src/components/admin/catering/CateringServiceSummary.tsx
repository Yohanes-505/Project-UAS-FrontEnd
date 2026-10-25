import { SourceNote } from "@/components/admin/booking";
import { Icon } from "@/components/ui/Icon";
import { cateringOverview, cateringRupiah } from "@/lib/catering";
import type { Catering } from "@/types";

/** ringkasan Layanan */
export function CateringServiceSummary({ catering }: { catering: Catering[] }) {
  const sum = cateringOverview(catering);

  return (
    <section className="reveal catering-service-card" style={{ animationDelay: "230ms" }}>
      <div className="d-flex align-items-start justify-content-between u-gap-3">
        <div>
          <p className="u-text-base fw-semibold u-text-ink">Ringkasan Layanan</p>
          <p className="u-text-xs ink60">Komposisi pesanan aktif</p>
        </div>
        <span className="catering-service-icon">
          <Icon name="utensils-crossed" className="u-size-5" />
        </span>
      </div>
      <div className="catering-service-list">
        <div>
          <span><Icon name="package" className="u-size-4" />Nasi Kotak</span>
          <strong id="catering-service-box">{sum.box} order</strong>
        </div>
        <div>
          <span><Icon name="concierge-bell" className="u-size-4" />Prasmanan</span>
          <strong id="catering-service-buffet">{sum.buffet} order</strong>
        </div>
      </div>
      <div className="catering-payment-summary">
        <div>
          <span>DP diterima</span>
          <strong id="catering-dp-received">{cateringRupiah(sum.dp, true)}</strong>
        </div>
        <div className="catering-progress">
          <span id="catering-payment-progress" style={{ width: `${sum.percent}%` }} />
        </div>
        <small id="catering-payment-caption">{sum.percent}% dari nilai pesanan aktif</small>
      </div>
      <SourceNote>
        Form “Pesan Katering” pada website nantinya dapat mengirim permintaan langsung ke halaman ini.
      </SourceNote>
    </section>
  );
}
