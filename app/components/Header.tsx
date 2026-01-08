import Link from "next/link";
import { FileSearch, FileText, History, Menu, Sparkles, User, X } from "lucide-react";

const navigation = [
  { name: "New Job", href: "/job/new", icon: FileText },
  { name: "CV Report", href: "/cv/analyze", icon: FileSearch },
  { name: "History", href: "/history", icon: History },
  { name: "Account", href: "/account", icon: User },
];

const navLinkClass =
  "group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F0F2F8] hover:text-[#3D64FF]";
const navIconClass =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE0E0] bg-[#FFFFFF] text-[#3D64FF] transition-colors group-hover:border-[#3D64FF]/40 group-hover:bg-[#F0F2F8]";

export default function Header() {
  return (
    <header className="relative z-40">
      <input id="nav-toggle" type="checkbox" className="peer sr-only" />

      <div className="border-b border-[#DCE0E0] bg-[#FFFFFF]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3 text-base font-semibold text-[#181B31]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D64FF] text-[#FFFFFF] shadow-[0_8px_24px_rgba(24,27,49,0.18)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              CV Analyzer
              <span className="block text-xs font-normal text-[#8A94A6]">AI talent intelligence</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={navLinkClass}>
                  <span className={navIconClass}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#181B31] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
          </div>

          <label
            htmlFor="nav-toggle"
            aria-label="Open menu"
            className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-2 text-sm font-medium text-[#4B5563] transition hover:border-[#3D64FF]/60 hover:text-[#3D64FF] lg:hidden"
          >
            <Menu className="h-5 w-5" />
            Menu
          </label>
        </div>
      </div>

      <label
        htmlFor="nav-toggle"
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-[#181B31]/45 opacity-0 pointer-events-none transition-opacity duration-200 peer-checked:pointer-events-auto peer-checked:opacity-100 lg:hidden"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-72 -translate-x-full rounded-r-3xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft transition-transform duration-300 peer-checked:translate-x-0 lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-[#DCE0E0] px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-[#181B31]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3D64FF] text-[#FFFFFF] shadow-[0_8px_24px_rgba(24,27,49,0.18)]">
              <Sparkles className="h-5 w-5" />
            </span>
            CV Analyzer
          </Link>
          <label
            htmlFor="nav-toggle"
            aria-label="Close menu"
            className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/60 hover:text-[#3D64FF]"
          >
            <X className="h-5 w-5" />
          </label>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={navLinkClass}>
                <span className={navIconClass}>
                  <Icon className="h-5 w-5" />
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pb-8">
          <div className="rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
            <p className="font-semibold text-[#181B31]">Pro tip</p>
            <p className="mt-1 leading-relaxed text-[#4B5563]">
              Keep your job posts updated to help the AI learn and surface stronger matches over time.
            </p>
          </div>
        </div>
      </aside>
    </header>
  );
}
