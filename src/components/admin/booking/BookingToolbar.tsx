import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface BookingToolbarProps {
  prefix: "reservation" | "catering";
  placeholder: string;
  search: string;
  onSearch: (value: string) => void;
  onReset: () => void;
  /** tombol filter */
  children: ReactNode;
}

/** baris pencarian filter n tombol reset di ats tabel */
export function BookingToolbar({ prefix, placeholder, search, onSearch, onReset, children }: BookingToolbarProps) {
  return (
    <div className="d-flex w-100 flex-wrap align-items-center justify-content-between u-gap-3">
      <div className={`${prefix}-search-wrap`}>
        <Icon name="search" className="u-size-4 ink60" />
        <input
          id={`${prefix}-search`}
          className={`${prefix}-search-input`}
          type="search"
          placeholder={placeholder}
          autoComplete="off"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="d-flex flex-wrap align-items-center u-gap-2">
        {children}
        <button
          id={`${prefix}-reset`}
          type="button"
          className="filter-pill d-flex align-items-center u-gap-2 rounded-pill u-border u-border-solid border-soft bg-white u-px-3 u-py-2 u-text-sm u-text-ink"
          onClick={onReset}
        >
          <Icon name="rotate-ccw" className="u-size-4" /> Reset
        </button>
      </div>
    </div>
  );
}
