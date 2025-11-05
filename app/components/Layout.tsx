'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, History, User, Menu, X, Sparkles } from 'lucide-react';

const navigation = [
  { name: 'New Job', href: '/job/new', icon: FileText },
  { name: 'History', href: '/history', icon: History },
  { name: 'Account', href: '/account', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const renderNavLinks = (onLinkClick?: () => void) =>
    navigation.map((item) => {
      const Icon = item.icon;
      const isActive = pathname?.startsWith(item.href);
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={onLinkClick}
          className={`group flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white shadow-glow-primary'
              : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              isActive
                ? 'border-white/30 bg-white/20 text-white'
                : 'border-primary-100 bg-primary-50 text-primary-500 group-hover:border-primary-200 group-hover:bg-primary-100'
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          {item.name}
        </Link>
      );
    });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/30 text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-200/50 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full bg-accent-200/40 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-1/4 h-[22rem] w-[22rem] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-50 transform-gpu text-slate-700 transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-72 transform rounded-r-3xl border border-slate-200 bg-white shadow-card-soft transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-[0_10px_25px_-15px_rgba(124,58,237,0.55)]">
                <Sparkles className="h-5 w-5" />
              </span>
              CV Analyzer
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-primary-200 hover:text-primary-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-4 py-6">{renderNavLinks(() => setSidebarOpen(false))}</nav>
          <div className="px-6 pb-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Pro tip</p>
              <p className="mt-1 leading-relaxed text-slate-600">
                Keep your job posts updated to help the AI learn and surface stronger matches over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
            <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 text-white shadow-[0_18px_30px_-18px_rgba(124,58,237,0.45)]">
                <Sparkles className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                CV Analyzer
                <span className="block text-xs font-normal text-slate-500">AI talent intelligence</span>
              </span>
            </Link>
          </div>
          <nav className="flex-1 space-y-3 px-5 py-8">{renderNavLinks()}</nav>
          <div className="px-6 pb-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Need a hand?</p>
              <p className="mt-1 text-xs text-slate-600">
                Explore our playbooks for writing job descriptions that resonate with top candidates.
              </p>
              <Link
                href="/history"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
              >
                View guides
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
          >
            <User className="h-5 w-5" />
            Account
          </Link>
        </div>
        <main className="relative py-10 sm:py-12">
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
