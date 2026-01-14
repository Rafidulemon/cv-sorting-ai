"use client";

export default function ClientLayoutLoading() {
  return (
    <div className="relative h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(216,8,128,0.12),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(61,100,255,0.12),transparent_40%),linear-gradient(180deg,rgba(249,246,255,0.92),rgba(245,246,255,0.94),rgba(253,249,255,0.98))] text-[#1f2a44]">
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/70 px-8 py-6 text-center shadow-card-soft">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-100/60" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-primary-100/70" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Loading</p>
            <p className="text-xs text-[#6b7280]">Preparing your workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
}
