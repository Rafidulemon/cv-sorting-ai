import { Sparkles, Timer } from "lucide-react";

type ComingSoonProps = {
  title: string;
  description?: string;
};

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-fuchsia-500/10" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-primary-100 ring-1 ring-slate-700">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Coming soon</p>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="text-sm text-slate-300">{description}</p> : null}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300">
          <Timer className="h-4 w-4 text-primary-200" />
          Work in progress
        </div>
      </div>
    </div>
  );
}
