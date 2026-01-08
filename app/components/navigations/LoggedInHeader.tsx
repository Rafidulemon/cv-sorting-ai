"use client";

import Image from "next/image";
import { Bell, Mail, Menu, Search, X } from "lucide-react";

type LoggedInHeaderProps = {
  isNavOpen: boolean;
  onToggleNav: () => void;
};

export default function LoggedInHeader({
  isNavOpen,
  onToggleNav,
}: LoggedInHeaderProps) {
  return (
    <header className="rounded-xl border border-white/70 bg-gradient-to-r from-[#fbf8ff] via-[#f7f3ff] to-[#fbf9ff] p-4 shadow-[0_24px_55px_-34px_rgba(84,65,122,0.35)] backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            aria-label="Toggle navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e6dff5] bg-white/90 text-[#5c5177] shadow-[0_12px_28px_-18px_rgba(82,66,139,0.35)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500 md:hidden"
            onClick={onToggleNav}
          >
            {isNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="relative flex-1">
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
                carriastic@team
              </p>
              <p className="text-[11px] font-medium text-[#9f97b8]">Admin</p>
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
