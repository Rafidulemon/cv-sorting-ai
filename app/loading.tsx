export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="h-3 w-3 animate-ping rounded-full bg-primary-400" aria-hidden />
        <p className="text-sm font-semibold tracking-wide text-slate-200">Loading carriX…</p>
      </div>
    </div>
  );
}
