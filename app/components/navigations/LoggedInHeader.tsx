"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Mail, Menu, RefreshCw, Search, X } from "lucide-react";

type LoggedInHeaderProps = {
  isNavOpen: boolean;
  onToggleNav: () => void;
};

export default function LoggedInHeader({
  isNavOpen,
  onToggleNav,
}: LoggedInHeaderProps) {
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCredits = async () => {
      try {
        const response = await fetch("/api/credits/balance");
        if (!response.ok) throw new Error("Failed to load credits");
        const data = await response.json();
        if (isMounted) {
          setCredits({ remaining: data.remaining, total: data.total });
        }
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

  const creditUsage = credits?.total
    ? Math.min(100, Math.round((credits.remaining / credits.total) * 100))
    : 0;

  return (
    <header className="rounded-xl border border-white/70 bg-gradient-to-r from-[#fbf8ff] via-[#f7f3ff] to-[#fbf9ff] p-4 shadow-[0_24px_55px_-34px_rgba(84,65,122,0.35)] backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 w-[30%]" >
          <div className="relative flex-1 w-full">
            <div className="flex h-12 items-center gap-3 rounded-[18px] border border-[#e6dff5] bg-white/90 px-4 shadow-[0_15px_45px_-30px_rgba(82,66,139,0.42)] transition focus-within:border-[#ccb9ff] focus-within:shadow-[0_18px_45px_-24px_rgba(124,94,171,0.45)]">
              <Search className="h-5 w-5 text-[#8e86a9]" />
              <input
                type="search"
                placeholder="Search jobs or candidates..."
                className="w-full bg-transparent text-sm font-medium text-[#5c5177] placeholder:text-[#a8a0be] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div className="hidden items-center gap-3 rounded-2xl border border-[#e6dff5] bg-white/90 px-4 py-2 text-[#5c5177] shadow-[0_16px_38px_-28px_rgba(82,66,139,0.36)] md:flex">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-3">
                <RefreshCw className="h-4 w-4 text-[#3D64FF]" />
                <span className="text-sm font-medium text-base">
                  Remaining{" "}
                  <span className="font-semibold">
                    {isLoadingCredits ? "…" : credits?.remaining?.toLocaleString() ?? "—"}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold">
                    {isLoadingCredits ? "…" : credits?.total?.toLocaleString() ?? "—"}
                  </span>{" "}
                  carriX Credit
                </span>
                <Link
                  href="/credits"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-500 to-[#f06292] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-[0_12px_28px_-20px_rgba(216,8,128,0.55)] transition hover:translate-y-[-1px]"
                >
                  Buy more
                </Link>
              </div>
              <div
                className={`h-2 w-full overflow-hidden rounded-full bg-[#f0e8f7] ${
                  isLoadingCredits ? "animate-pulse" : ""
                }`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292]"
                  style={{ width: `${creditUsage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[#e6dff5] bg-white/90 text-[#8e86a9] shadow-[0_12px_32px_-22px_rgba(82,66,139,0.4)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="cursor-pointer flex items-center gap-3 rounded-full border border-[#e6dff5] bg-white/90 px-2 py-2 shadow-[0_16px_38px_-28px_rgba(82,66,139,0.36)]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#b8a6ff] to-[#8a7ae5] text-white shadow-[0_12px_25px_-16px_rgba(116,92,183,0.65)]">
              <Mail className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#5c5177]">
                Md. Rafidul
              </p>
            </div>
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#e6dff5] bg-white shadow-[0_12px_30px_-20px_rgba(82,66,139,0.4)]">
              <Image
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80"
                alt="User avatar"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
