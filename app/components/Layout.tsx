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
          className={`group flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white shadow-glow-primary'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors ${
              isActive
                ? 'border-white/20 bg-white/20 text-white'
                : 'text-primary-100 group-hover:border-white/20 group-hover:bg-white/10'
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          {item.name}
        </Link>
      );
    });

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full bg-accent-500/25 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-1/4 h-[22rem] w-[22rem] rounded-full bg-sky-400/25 blur-3xl" />
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-50 transform-gpu text-slate-200 transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-72 transform rounded-r-3xl border border-white/10 bg-slate-900/95 shadow-glow-primary transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-glow-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              CV Analyzer
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-white/10 p-2 text-slate-200 transition hover:border-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-4 py-6">{renderNavLinks(() => setSidebarOpen(false))}</nav>
          <div className="px-6 pb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              <p className="font-semibold text-white">Pro tip</p>
              <p className="mt-1 leading-relaxed">
                Keep your job posts updated to help the AI learn and surface stronger matches over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 text-white shadow-glow-primary">
                <Sparkles className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                CV Analyzer
                <span className="block text-xs font-normal text-slate-300">AI talent intelligence</span>
              </span>
            </Link>
          </div>
          <nav className="flex-1 space-y-3 px-5 py-8">{renderNavLinks()}</nav>
          <div className="px-6 pb-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Need a hand?</p>
              <p className="mt-1 text-xs text-slate-300">
                Explore our playbooks for writing job descriptions that resonate with top candidates.
              </p>
              <Link
                href="/history"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                View guides
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/70 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
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
