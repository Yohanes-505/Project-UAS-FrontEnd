"use client";

import { usePathname, useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/Dropdown";
import { Icon, type IconName } from "@/components/ui/Icon";
import { findAdminNav, QUICK_ACTION_NEW, QUICK_ACTION_PARAM } from "@/lib/admin-nav";

const QUICK_ACTIONS: Array<{ title: string; hint: string; icon: IconName; href: string }> = [
  { title: "Pesanan Baru", hint: "Catat pesanan pelanggan", icon: "receipt", href: "/admin-dashboard/pesanan" },
  { title: "Reservasi Baru", hint: "Tambahkan booking meja", icon: "calendar-plus", href: "/admin-dashboard/reservasi" },
  { title: "Katering Baru", hint: "Catat pesanan jumlah besar", icon: "package-plus", href: "/admin-dashboard/katering" },
];

function pageTitle(pathname: string): string {
  const nav = findAdminNav(pathname);
  if (nav) return nav.label.toUpperCase();
  const last = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  return last.replace(/-/g, " ").toUpperCase();
}

export function Header({ onOpenNotifications }: { onOpenNotifications: () => void }) {
  const pathname = usePathname().replace(/\/+$/, "");
  const router = useRouter();
  const isDashboard = pathname === "/admin-dashboard";

  return (
    <header className="app-header d-flex u-h-72px w-100 flex-shrink-0 align-items-center justify-content-between u-border-b u-border-solid border-soft bg-white u-px-8">
      <p id="page-title" className="u-font-anton u-text-2xl u-leading-1-3 u-text-ink">
        {pageTitle(pathname)}
      </p>

      <div className="d-flex align-items-center u-gap-4">
        {isDashboard && (
          <Dropdown
            id="quick-action"
            wrapperId="dashboard-quick-actions"
            align="right"
            menuClassName="quick-action-menu"
            triggerLabel="Buat transaksi baru"
            triggerClassName="quick-action-button press d-flex align-items-center u-gap-2 rounded-pill u-bg-maroon u-px-4 u-py-2-5 u-text-sm fw-medium text-white"
            trigger={
              <>
                <Icon name="plus" className="u-size-4" />
                <span>Pesanan Baru</span>
                <Icon name="chevron-down" className="u-size-4 quick-action-chevron" />
              </>
            }
          >
            {(close) =>
              QUICK_ACTIONS.map((action) => (
                <button
                  key={action.href}
                  type="button"
                  role="menuitem"
                  className="menu-opt quick-action-option d-flex w-100 align-items-center u-gap-3 u-rounded-lg u-px-3 u-py-2 text-start"
                  onClick={(event) => {
                    event.stopPropagation();
                    close();
                    router.push(`${action.href}?${QUICK_ACTION_PARAM}=${QUICK_ACTION_NEW}`);
                  }}
                >
                  <span className="quick-action-icon">
                    <Icon name={action.icon} className="u-size-4" />
                  </span>
                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.hint}</small>
                  </span>
                </button>
              ))
            }
          </Dropdown>
        )}

        <button
          type="button"
          id="btn-notif"
          aria-label="Notifikasi"
          onClick={onOpenNotifications}
          className="u-grid u-size-10 flex-shrink-0 u-place-items-center rounded-pill u-border u-border-solid border-soft bg-white u-text-ink u-transition-transform u-hover-scale-105 u-active-scale-95"
        >
          <Icon name="bell" className="u-size-5" />
        </button>
      </div>
    </header>
  );
}
