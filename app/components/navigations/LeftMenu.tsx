"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Puzzle,
  Settings,
  UserRound,
  Users2,
  Plus,
} from "lucide-react";

type LeftMenuProps = {
  isNavOpen: boolean;
  onToggleNav: () => void;
  onCloseNav: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Credits", href: "/credits", icon: CreditCard },
  { label: "Candidates", href: "/cv/analyze", icon: Users2 },
  { label: "Reports", href: "/history", icon: BarChart3 },
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Integrations", href: "/integrations", icon: Puzzle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function LeftMenu({
  isNavOpen,
  onToggleNav,
  onCloseNav,
}: LeftMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCredits = async () => {
      try {
        const response = await fetch("/api/credits/balance");
        if (!response.ok) throw new Error("Failed to load credits");
        const data = await response.json();
        if (isMounted) setCredits({ remaining: data.remaining, total: data.total });
      } catch (error) {
        console.error(error);
        if (isMounted) setCredits(null);
      } finally {
        if (isMounted) setIsLoadingCredits(false);
      }
    };

    loadCredits();
    return () => {
      isMounted = false;
    };
  }, []);

  const creditUsage =
    credits?.total && credits.total > 0
      ? Math.min(100, Math.round((credits.remaining / credits.total) * 100))
      : 0;

  const handleLogout = () => {
    router.push("/auth/login");
    onCloseNav();
  };

  return (
    <aside
      className={`fixed left-4 top-4 z-30 h-[calc(100vh-2rem)] max-h-screen overflow-y-auto min-w-[260px] overflow-hidden rounded-xl border border-white/70 bg-white/85 p-5 shadow-card-soft backdrop-blur transition-transform duration-300 lg:sticky lg:left-0 lg:top-4 lg:h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-3rem)] lg:translate-x-0 ${
        isNavOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-primary-100 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-32 w-32 rounded-full bg-[#f7ecff] blur-3xl" />
        <div className="absolute bottom-0 left-6 h-28 w-28 rounded-full bg-[#dce5ff] blur-2xl" />
      </div>
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1 cursor-pointer">
            <Image
              src="/logo/icon.png"
              alt="carriX"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />

            <p className="text-xl font-semibold transition-colors duration-300 text-[#D80880]">
              carriX
            </p>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#efe7f5] bg-white text-[#9aa0b5] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500 md:hidden"
            onClick={onToggleNav}
          >
            X
          </button>
        </div>

        <Link
          href="/jobs/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_45px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
          onClick={onCloseNav}
        >
          <Plus className="h-4 w-4" />
          New Screening Job
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-primary-500 to-[#f06292] text-white shadow-glow-primary"
                    : "bg-white/80 text-[#1f2a44] hover:bg-white hover:shadow-sm"
                }`}
                onClick={onCloseNav}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="space-y-3 rounded-xl border border-white/60 bg-white/70 p-4 shadow-inner backdrop-blur">
            <div className="flex items-center justify-between text-sm font-semibold text-[#1f2a44]">
              <span>carriX credits</span>
              <span className="text-xs text-[#8a90a6]">
                {isLoadingCredits
                  ? "Loading..."
                  : `${credits?.remaining?.toLocaleString() ?? "-"} / ${credits?.total?.toLocaleString() ?? "-"}`
                }
              </span>
            </div>
            <div
              className={`h-2 rounded-full bg-[#f4e9f5] ${isLoadingCredits ? "animate-pulse" : ""}`}
              aria-hidden
            >
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-[#f06292] shadow-[0_6px_20px_-10px_rgba(216,8,128,0.75)]"
                style={{ width: `${creditUsage}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="mb-2 flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 hover:text-red-800"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-3 cursor-pointer">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-100 text-red-600">
                <LogOut className="h-5 w-5" />
              </span>
              <span>Log out</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
