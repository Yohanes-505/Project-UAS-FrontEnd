import { StatCard } from "@/components/ui/StatCard";
import { cateringRupiah, cateringStats } from "@/lib/catering";
import type { Catering } from "@/types";

interface CateringStatsProps {
  catering: Catering[];
  onPickStatus: (status: "Semua" | "Menunggu") => void;
}

/** 4 kartu angka di atas halaman Katering */
export function CateringStats({ catering, onPickStatus }: CateringStatsProps) {
  const stats = cateringStats(catering);
  return (
    <div className="catering-stat-grid">
      <StatCard variant="catering" icon="calendar-check-2" iconClassName="catering-icon-maroon"
        label="Katering Mendatang" value={stats.upcoming} caption="agenda aktif"
        onClick={() => onPickStatus("Semua")} delay={80} />
      <StatCard variant="catering" icon="file-clock" iconClassName="catering-icon-amber"
        label="Perlu Tindak Lanjut" value={stats.pending} caption="menunggu / penawaran"
        onClick={() => onPickStatus("Menunggu")} delay={110} />
      <StatCard variant="catering" icon="users" iconClassName="catering-icon-green"
        label="Pax 7 Hari" value={stats.pax.toLocaleString("id-ID")} caption="porsi terjadwal" delay={140} />
      <StatCard variant="catering" icon="wallet-cards" iconClassName="catering-icon-soft"
        label="Nilai Pesanan Aktif" value={cateringRupiah(stats.value, true)} caption="di luar pembatalan" delay={170} />
    </div>
  );
}
