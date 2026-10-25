import { SourceNote } from "@/components/admin/booking";
import { Icon } from "@/components/ui/Icon";
import { dotTime } from "@/lib/booking";
import type { Settings } from "@/types";

/** jam Reservasi */
export function ReservationHours({ settings }: { settings: Settings }) {
  return (
    <section className="reveal reservation-hours-card" style={{ animationDelay: "230ms" }}>
      <div className="reservation-hours-icon">
        <Icon name="clock" className="u-size-5" />
      </div>
      <div>
        <p className="u-text-base fw-semibold u-text-ink">Jam Reservasi</p>
        <p className="u-text-xs ink60">Mengikuti jam buka pada website Lamak Bana.</p>
      </div>
      <div className="reservation-hours-list">
        <div>
          <span>Senin–Jumat</span>
          <strong>{dotTime(settings.weekdayOpen)}–{dotTime(settings.weekdayClose)}</strong>
        </div>
        <div>
          <span>Sabtu–Minggu</span>
          <strong>{dotTime(settings.weekendOpen)}–{dotTime(settings.weekendClose)}</strong>
        </div>
      </div>
      <SourceNote>
        Reservasi dari website dapat masuk ke daftar ini setelah endpoint booking dihubungkan.
      </SourceNote>
    </section>
  );
}
