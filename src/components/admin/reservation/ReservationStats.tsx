import { StatCard } from "@/components/ui/StatCard";
import { reservationStats, TOTAL_TABLES } from "@/lib/reservations";
import type { Reservation } from "@/types";

interface ReservationStatsProps {
  reservations: Reservation[];
  onPickStatus: (status: "Semua" | "Menunggu") => void;
}

/** 4 kartu angka di atas halaman reserv */
export function ReservationStats({ reservations, onPickStatus }: ReservationStatsProps) {
  const stats = reservationStats(reservations);
  return (
    <div className="reservation-stat-grid">
      <StatCard variant="reservation" icon="calendar-days" iconClassName="reservation-icon-maroon"
        label="Reservasi Hari Ini" value={stats.today} caption="booking terjadwal"
        onClick={() => onPickStatus("Semua")} delay={80} />
      <StatCard variant="reservation" icon="clock-3" iconClassName="reservation-icon-amber"
        label="Menunggu Konfirmasi" value={stats.pending} caption="perlu ditindaklanjuti"
        onClick={() => onPickStatus("Menunggu")} delay={110} />
      <StatCard variant="reservation" icon="users" iconClassName="reservation-icon-green"
        label="Tamu Hari Ini" value={stats.guests} caption="pax terjadwal" delay={140} />
      <StatCard variant="reservation" icon="armchair" iconClassName="reservation-icon-soft"
        label="Meja Terisi" value={`${stats.tables}/${TOTAL_TABLES}`} caption="booking aktif hari ini" delay={170} />
    </div>
  );
}
