"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import ClientHeader from "../components/navigations/ClientHeader";
import ClientFooter from "@/app/components/navigations/ClientFooter";
import LeftMenu from "@/app/components/navigations/LeftMenu";

export default function LoggedInLayout({ children }: { children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => setIsNavOpen((open) => !open);
  const closeNav = () => setIsNavOpen(false);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_18%_16%,rgba(216,8,128,0.08),transparent_38%),radial-gradient(circle_at_82%_10%,rgba(61,100,255,0.08),transparent_38%),radial-gradient(circle_at_10%_70%,rgba(216,8,128,0.06),transparent_35%),linear-gradient(180deg,#f9f6ff,#f5f6ff,#fdf9ff)] text-[#1f2a44]">
      <div className="relative mx-auto flex gap-6 px-4 py-6 md:px-6">
        <LeftMenu
          isNavOpen={isNavOpen}
          onToggleNav={toggleNav}
          onCloseNav={closeNav}
        />

        {isNavOpen ? (
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={closeNav}
          />
        ) : null}

        <div className="relative flex w-full flex-col gap-4">
          <ClientHeader isNavOpen={isNavOpen} onToggleNav={toggleNav} />
          <main className="flex-1">
            <div className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-card-soft backdrop-blur md:p-6">
              {children}
            </div>
          </main>
          <ClientFooter />
        </div>
      </div>
    </div>
  );
}
