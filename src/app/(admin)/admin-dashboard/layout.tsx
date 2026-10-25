import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/** Sidebar + Header membungkus semua halaman /admin-dashboard/... */
export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
