import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bug,
  CheckCircle2,
  FileWarning,
  Shield,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";

const errorGroups = [
  { label: "Parser fail", count: 7, detail: "Schema mismatch, missing sections" },
  { label: "OCR fail", count: 6, detail: "Low DPI, non-Latin, corrupted PDF" },
  { label: "Model error", count: 5, detail: "Rate limits or malformed prompt" },
];

const failedDocs = [
  {
    id: "doc-2481",
    workspace: "Acme Talent",
    stage: "OCR",
    reason: "Low contrast image",
    time: "9m ago",
    step: "OCR",
  },
  {
    id: "doc-2482",
    workspace: "Northwind",
    stage: "Parser",
    reason: "Unexpected header layout",
    time: "18m ago",
    step: "Extraction",
  },
  {
    id: "doc-2491",
    workspace: "Lumina HR",
    stage: "Model",
    reason: "LLM rate limited",
    time: "26m ago",
    step: "Scoring",
  },
  {
    id: "doc-2494",
    workspace: "Nova Labs",
    stage: "Parser",
    reason: "Unicode decode",
    time: "41m ago",
    step: "Extraction",
  },
];

export default function FailedDocumentsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Failed documents</p>
          <h1 className="text-2xl font-semibold text-white">Triage & reprocess</h1>
          <p className="text-sm text-slate-400">
            Error groups (parser, OCR, model) plus metadata, logs, and reprocess with selectable pipeline step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100" type="button">
            Toggle PII redaction
          </button>
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
          >
            <Shield className="h-4 w-4" />
            View logs
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        {errorGroups.map((group) => (
          <div key={group.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{group.label}</p>
                <h3 className="text-lg font-semibold text-white">{group.count} docs</h3>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-sm text-slate-300">{group.detail}</p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100" type="button">
              Reprocess batch
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Failure center</p>
            <h2 className="text-lg font-semibold text-white">Docs with metadata + logs</h2>
          </div>
          <Badge tone="warning">Reprocess with stage selection</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Document</th>
                <th className="px-4 py-3 text-left font-semibold">Workspace</th>
                <th className="px-4 py-3 text-left font-semibold">Failed stage</th>
                <th className="px-4 py-3 text-left font-semibold">Reason</th>
                <th className="px-4 py-3 text-left font-semibold">Last error</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {failedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{doc.id}</td>
                  <td className="px-4 py-3 text-primary-100">{doc.workspace}</td>
                  <td className="px-4 py-3">
                    <Badge tone={doc.stage === "Model" ? "warning" : doc.stage === "Parser" ? "danger" : "info"}>
                      {doc.stage}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{doc.reason}</td>
                  <td className="px-4 py-3 text-slate-300">{doc.time}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                        View metadata
                      </button>
                      <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
                        Logs
                      </button>
                      <button className="rounded-lg border border-amber-600/60 bg-amber-500/10 px-2.5 py-1 text-amber-100" type="button">
                        Reprocess from {doc.step}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">PII redaction</p>
              <h3 className="text-lg font-semibold text-white">Support mode</h3>
            </div>
            <Badge tone="info">Toggle</Badge>
          </div>
          <p className="text-sm text-slate-300">
            When enabled, extracted text and logs mask PII for support admins. Every toggle is logged with actor/IP.
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Runbooks</p>
              <h3 className="text-lg font-semibold text-white">Known issues</h3>
            </div>
            <Bug className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <StatusDot />
              OCR failures: check DPI &gt; 150, language auto-detect, fallback to Vision OCR.
            </li>
            <li className="flex items-start gap-2">
              <StatusDot />
              Parser schema: refresh template cache, re-run from extraction.
            </li>
            <li className="flex items-start gap-2">
              <StatusDot />
              Model errors: retry with cache bypass + throttle to avoid rate limits.
            </li>
          </ul>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Audit</p>
              <h3 className="text-lg font-semibold text-white">Everything logged</h3>
            </div>
            <TerminalSquare className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-sm text-slate-300">
            Reprocess, PII toggle, and exports emit audit entries (who, when, what, IP). Impersonation sessions show a banner.
          </p>
          <Link href="/admin/audit-logs" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-50">
            View audit log
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Badge({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
}) {
  const base =
    tone === "warning"
      ? "bg-amber-500/15 text-amber-100 ring-amber-500/30"
      : tone === "danger"
        ? "bg-danger-500/15 text-danger-100 ring-danger-500/30"
        : tone === "success"
          ? "bg-success-500/15 text-success-100 ring-success-500/30"
          : "bg-primary-500/15 text-primary-100 ring-primary-500/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${base}`}>
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "danger" ? <FileWarning className="h-3 w-3" /> : tone === "success" ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}

function StatusDot() {
  return <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />;
}
