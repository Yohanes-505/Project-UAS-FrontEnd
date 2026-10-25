import { Icon, type IconName } from "@/components/ui/Icon";

/** tampilan kalo hasil pencarian ato filter kosong */
export function BookingEmpty({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="reservation-empty">
      <Icon name={icon} className="u-size-5" />
      <p className="u-text-sm fw-medium u-text-ink">{title}</p>
      <p className="u-text-xs ink60">Coba ubah pencarian atau filter.</p>
    </div>
  );
}
