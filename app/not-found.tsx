import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 px-8 py-10 text-center shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-primary-100 ring-1 ring-slate-700">
          <MapPinOff className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">404</p>
          <h1 className="text-2xl font-semibold text-white">Page not found</h1>
          <p className="text-sm text-slate-300">The page you’re looking for doesn’t exist or has moved.</p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
