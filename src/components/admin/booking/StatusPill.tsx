import { pickStatusStyle } from "@/lib/booking";
import type { StatusStyle } from "@/types";

/**
 * Label status kecil berwarna */
export function StatusPill({ status, styles }: { status: string; styles: Record<string, StatusStyle> }) {
  const style = pickStatusStyle(styles, status);
  return (
    <span className="reservation-status-badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}
