"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useSettings } from "@/hooks/useSettings";
import { NAV_LAINNYA, NAV_UTAMA, type AdminNavItem } from "@/lib/admin-nav";
import { cx, initials } from "@/lib/format";

const NAV_ITEM_CLASS =
  "app-nav-item d-flex w-100 align-items-center u-gap-3 u-rounded-lg u-px-3 u-py-2 text-start u-text-sm fw-medium u-leading-5 u-transition-colors text-decoration-none";

function NavLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cx(NAV_ITEM_CLASS, active && "is-active")}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={item.icon} className="u-size-5 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname().replace(/\/+$/, "");
  const [settings] = useSettings();
  const isActive = (item: AdminNavItem) => pathname === item.href;

  return (
    <aside className="app-sidebar d-flex u-w-300px flex-shrink-0 flex-column u-gap-8 align-self-stretch u-border-r u-border-solid border-soft bg-white u-px-5 u-py-6">
      <div className="brand-lockup d-flex flex-column u-gap-0-5">
        <p className="u-font-anton u-text-2xl u-leading-1-3 u-text-maroon">LAMAK BANA</p>
        <p className="u-text-xs u-leading-4 ink60">Admin Panel</p>
      </div>

      <div className="admin-card d-flex w-100 align-items-center u-gap-3 u-rounded-xl u-border u-border-solid border-soft bg-white u-p-3">
        <div
          className="u-grid u-size-10 flex-shrink-0 u-place-items-center rounded-pill"
          style={{ background: "rgba(139,30,30,.08)" }}
        >
          <p id="sidebar-admin-initials" className="u-text-xs fw-medium u-leading-4 u-text-maroon">
            {initials(settings.adminName)}
          </p>
        </div>
        <div className="d-flex u-min-w-0 u-flex-1 flex-column u-gap-0-5">
          <p id="sidebar-admin-name" className="text-truncate u-text-sm fw-medium u-leading-5 u-text-ink">
            {settings.adminName || "Admin Utama"}
          </p>
          <p id="sidebar-admin-role" className="u-text-xs u-leading-4 ink60">
            {settings.adminRole || "Super Admin"}
          </p>
        </div>
        <Link
          href="/admin-dashboard/pengaturan"
          aria-label="Pengaturan"
          className="u-grid u-size-6 flex-shrink-0 u-place-items-center ink60 u-transition-colors u-hover-text-ink"
        >
          <Icon name="settings" className="u-size-5" />
        </Link>
      </div>

      <nav id="nav-utama" className="d-flex w-100 flex-column u-gap-1" aria-label="Menu utama">
        {NAV_UTAMA.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </nav>

      <div className="d-flex w-100 flex-column u-gap-1">
        <div className="d-flex align-items-center u-pb-1 u-pl-3 u-pt-2">
          <p className="u-text-xs fw-medium u-leading-4 u-tracking-0-24px ink60">LAINNYA</p>
        </div>
        <div id="nav-lainnya" className="d-flex w-100 flex-column u-gap-1">
          {NAV_LAINNYA.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item)} />
          ))}
        </div>
        <button
          type="button"
          id="btn-logout"
          onClick={onLogout}
          className="app-nav-item logout-item d-flex w-100 align-items-center u-gap-3 u-rounded-lg u-px-3 u-py-2 text-start u-text-sm fw-medium u-leading-5 u-transition-colors"
        >
          <Icon name="log-out" className="u-size-5 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
