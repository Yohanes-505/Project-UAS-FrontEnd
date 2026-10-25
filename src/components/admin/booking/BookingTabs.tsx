import { cx } from "@/lib/format";

interface BookingTabsProps<S extends string> {
  prefix: "reservation" | "catering";
  statuses: readonly S[];
  active: S;
  /** Jumlah data per status. */
  counts: Record<string, number>;
  onChange: (status: S) => void;
}

/** tab status di atas tabel */
export function BookingTabs<S extends string>({ prefix, statuses, active, counts, onChange }: BookingTabsProps<S>) {
  return (
    <div id={`${prefix}-tabs`} className={`${prefix}-tabs`}>
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          className={cx(`${prefix}-tab`, active === status && "is-active")}
          onClick={() => onChange(status)}
        >
          {status} <span>{counts[status] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
