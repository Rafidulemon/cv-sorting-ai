"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import type {
  AdminNavItem,
  AdminNavSection,
} from "@/app/components/navigations/adminNavConfig";
import { adminNavSections } from "@/app/components/navigations/adminNavConfig";
import Image from "next/image";

type AdminSidebarProps = {
  isNavOpen: boolean;
  onToggleNav: () => void;
  onCloseNav: () => void;
};

const versionLabel = "v0.1.0";

export default function AdminSidebar({
  isNavOpen,
  onToggleNav,
  onCloseNav,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() =>
    computeActiveParents(pathname),
  );

  const isActive = (href: string) => {
    const normalized = pathname.replace(/\/$/, "") || "/";
    const base = href.replace(/\/$/, "") || "/";
    if (base === "/admin") return normalized === "/admin";
    return normalized === base || normalized.startsWith(`${base}/`);
  };

  const toggleItem = (href: string) => {
    setOpenItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const forcedOpen = computeActiveParents(pathname);
  const mergedOpen = { ...openItems, ...forcedOpen };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.85)] transition-transform duration-300 ${
        isNavOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-1 cursor-pointer">
            <Image
              src="/logo/white_icon.png"
              alt="carriX"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />

            <p className="text-xl font-semibold transition-colors duration-300 text-white">
              carriX
            </p>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 shadow-sm transition hover:bg-slate-800/80 lg:hidden"
            onClick={onToggleNav}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {adminNavSections.map((section) => (
            <NavSection
              key={section.label}
              section={section}
              isActive={isActive}
              onCloseNav={onCloseNav}
              toggleItem={toggleItem}
              openItems={mergedOpen}
            />
          ))}
        </nav>

        <div className="border-t border-slate-800 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {versionLabel}
          </p>
        </div>
      </div>
    </aside>
  );
}

function computeActiveParents(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const map: Record<string, boolean> = {};
  adminNavSections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.children?.some((child) => normalized === child.href || normalized.startsWith(`${child.href}/`))) {
        map[item.href] = true;
      }
    });
  });
  return map;
}

function NavSection({
  section,
  isActive,
  onCloseNav,
  toggleItem,
  openItems,
}: {
  section: AdminNavSection;
  isActive: (href: string) => boolean;
  onCloseNav: () => void;
  toggleItem: (href: string) => void;
  openItems: Record<string, boolean>;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {section.label}
      </p>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onCloseNav={onCloseNav}
            toggleItem={toggleItem}
            isOpen={!!openItems[item.href]}
            childIsActive={item.children?.some((child) => isActive(child.href)) ?? false}
            isActive={isActive}
          />
        ))}
      </div>
    </div>
  );
}

function NavItem({
  item,
  active,
  onCloseNav,
  toggleItem,
  isOpen,
  childIsActive,
  isActive,
}: {
  item: AdminNavItem;
  active: boolean;
  onCloseNav: () => void;
  toggleItem: (href: string) => void;
  isOpen: boolean;
  childIsActive: boolean;
  isActive: (href: string) => boolean;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const selected = active || childIsActive;
  return (
    <div className="rounded-lg">
      <div
        className={`group flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition ${
          selected
            ? "border-primary-500 bg-primary-500/10 text-primary-100 shadow-[0_15px_45px_-35px_rgba(216,8,128,0.65)]"
            : "border-transparent text-slate-200 hover:bg-slate-800/70"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            selected ? "text-primary-300" : "text-slate-400 group-hover:text-slate-200"
          }`}
        />
        {hasChildren ? (
          <button
            type="button"
            className="flex flex-1 items-center justify-between text-left"
            onClick={() => toggleItem(item.href)}
          >
            <span>{item.label}</span>
            <ChevronDown
              className={`h-4 w-4 transition ${
                isOpen ? "rotate-180 text-primary-300" : "text-slate-400"
              }`}
            />
          </button>
        ) : (
          <Link href={item.href} onClick={onCloseNav} className="flex-1">
            {item.label}
          </Link>
        )}
        {item.badge ? (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            {item.badge}
          </span>
        ) : null}
      </div>
      {hasChildren ? (
        <div className={`${isOpen ? "max-h-64" : "max-h-0"} overflow-hidden transition-[max-height] duration-200`}>
          <div className="mt-1 space-y-1 rounded-md border-l border-slate-800 pl-8">
            {item.children?.map((child) => {
              const childActive = isActive(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onCloseNav}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                    childActive
                      ? "bg-primary-500/15 text-primary-100"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
