"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/app/components/navigations/AdminHeader";
import AdminFooter from "@/app/components/navigations/AdminFooter";
import AdminSidebar from "@/app/components/navigations/AdminSidebar";
import { getAdminNavItem } from "@/app/components/navigations/adminNavConfig";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();
  const activeItem = useMemo(() => getAdminNavItem(pathname), [pathname]);

  const toggleNav = () => setIsNavOpen((open) => !open);
  const closeNav = () => setIsNavOpen(false);

  const headerTitle =
    activeItem?.href === "/admin" ? "Admin Dashboard" : "Admin";
  const breadcrumb =
    activeItem && activeItem.href !== "/admin"
      ? `Admin / ${activeItem.label}`
      : "Admin console";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(147,51,234,0.16),transparent_32%),radial-gradient(circle_at_20%_78%,rgba(216,8,128,0.14),transparent_30%),linear-gradient(180deg,#060b16,#0c1222,#0b1020)] text-slate-100">
      <AdminSidebar
        isNavOpen={isNavOpen}
        onToggleNav={toggleNav}
        onCloseNav={closeNav}
      />

      {isNavOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={closeNav}
        />
      ) : null}

      <div className="flex min-h-screen flex-col px-4 py-6 md:px-6 lg:pl-[260px]">
        <AdminHeader
          title={headerTitle}
          breadcrumb={breadcrumb}
          onToggleNav={toggleNav}
        />

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </main>

        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
