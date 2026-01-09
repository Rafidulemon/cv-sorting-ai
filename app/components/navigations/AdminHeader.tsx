"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  Circle,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

type AdminHeaderProps = {
  title?: string;
  breadcrumb?: string;
  onToggleNav: () => void;
};

const quickActions = [
  { label: "Impersonate user", href: "/admin/impersonation" },
  { label: "Grant credits", href: "/admin/payments" },
  { label: "View failed docs", href: "/admin/failed-documents" },
];

export default function AdminHeader({
  title = "Admin Dashboard",
  breadcrumb,
  onToggleNav,
}: AdminHeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => signOut({ callbackUrl: "/auth/login" });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-sm transition hover:bg-slate-800/80 lg:hidden"
            onClick={onToggleNav}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-900/40 text-primary-100 ring-1 ring-primary-800/60">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-100">
                {title || "Admin"}
              </p>
              <p className="text-xs font-medium text-slate-400">
                {breadcrumb ?? "Admin console"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search company, user, job, CV..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-10 pr-3 text-sm text-slate-100 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <details className="relative">
            <summary className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-800/80 [&::-webkit-details-marker]:hidden">
              Quick Actions
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-800 bg-slate-900 shadow-lg">
              <ul className="divide-y divide-slate-800">
                {quickActions.map((action) => (
                  <li key={action.label}>
                    <Link
                      href={action.href}
                      className="block px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                    >
                      {action.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-sm transition hover:bg-slate-800/80"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white">
              4
            </span>
          </button>

          <details className="relative">
            <summary className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-800/80 [&::-webkit-details-marker]:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-900/40 text-primary-100 ring-1 ring-primary-800/60">
                AR
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-semibold text-slate-100">Admin</p>
                <p className="text-xs text-slate-400">Team</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </summary>
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-800 bg-slate-900 shadow-lg">
              <ul className="divide-y divide-slate-800 text-sm font-medium text-slate-100">
                <li>
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 transition hover:bg-slate-800"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/audit-logs"
                    className="block px-4 py-2 transition hover:bg-slate-800"
                  >
                    Audit Logs
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left transition hover:bg-slate-800"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </details>
        </div>
        </div>
      </header>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-900">Log out</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to log out of your admin session?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
