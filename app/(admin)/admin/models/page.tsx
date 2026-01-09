import { AlertTriangle, BadgeCheck, Brain, CheckCircle2, ClipboardCheck, Code2, Layers, RefreshCw } from "lucide-react";

const defaults = [
  { label: "Extraction", model: "gpt-4o-mini", latency: "p95 24s", cost: "$0.42 / 1k CVs" },
  { label: "Scoring", model: "gpt-4.1", latency: "p95 32s", cost: "$0.88 / 1k CVs" },
  { label: "Chat / Q&A", model: "gpt-4o-mini", latency: "p95 18s", cost: "$0.22 / 1k msgs" },
];

const versions = [
  { name: "Extraction v5", model: "gpt-4o-mini", status: "Live", changed: "2d ago", by: "Riley", notes: "Resume table fix, skills weighting +8%" },
  { name: "Scoring v7", model: "gpt-4.1", status: "Live", changed: "5d ago", by: "Priya", notes: "Calibration for sales roles" },
  { name: "Chat v3", model: "gpt-4o-mini", status: "Live", changed: "1d ago", by: "Samir", notes: "Shorter explanations, guardrails tightened" },
  { name: "Extraction v4", model: "gpt-3.5-turbo", status: "Archived", changed: "12d ago", by: "Nora", notes: "Fallback only" },
];

const prompts = [
  { name: "Scorecard (v12)", updated: "Today", by: "Riley", summary: "Signals: leadership + impact; penalize buzzwords" },
  { name: "Extraction (v9)", updated: "2d ago", by: "Amina", summary: "Education parsing fix; language detection tweak" },
  { name: "Chat follow-ups (v4)", updated: "3d ago", by: "Priya", summary: "Concise answers; cite resume sections" },
];

const evaluations = [
  { name: "Baseline vs v7 scoring", uplift: "+6.2% top-5 precision", samples: 420, owner: "Priya" },
  { name: "Extraction v5 vs v4", uplift: "-1.8% errors", samples: 280, owner: "Riley" },
  { name: "Chat safety sweep", uplift: "Pass 98%", samples: 180, owner: "Samir" },
];

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">AI & Quality</p>
          <h1 className="text-2xl font-semibold text-white">Models & prompts</h1>
          <p className="text-sm text-slate-400">Default models per feature, prompt versions, and quick rollback controls.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-slate-800/80"
          >
            <RefreshCw className="h-4 w-4" />
            Rollback last change
          </button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {defaults.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{item.label}</p>
                <h3 className="text-lg font-semibold text-white">{item.model}</h3>
                <p className="text-sm text-slate-400">{item.latency}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-primary-100 ring-1 ring-slate-700">
                <Brain className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Est. cost: {item.cost}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-100">
              <BadgeCheck className="h-3 w-3" />
              Default live
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Versions</p>
              <h2 className="text-lg font-semibold text-white">Model versions & rollout</h2>
            </div>
            <Layers className="h-5 w-5 text-primary-200" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Model</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Changed</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {versions.map((version) => (
                  <tr key={version.name} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{version.name}</p>
                        <p className="text-xs text-slate-400">By {version.by}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{version.model}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          version.status === "Live"
                            ? "bg-success-500/15 text-success-100"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {version.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{version.changed}</td>
                    <td className="px-4 py-3 text-slate-300">{version.notes}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100 transition hover:bg-primary-500/15" type="button">
                          Set live
                        </button>
                        <button className="rounded-lg border border-amber-600/60 bg-amber-500/10 px-2.5 py-1 text-amber-100 transition hover:bg-amber-500/20" type="button">
                          Rollback
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Prompts</p>
              <h2 className="text-lg font-semibold text-white">Latest versions</h2>
            </div>
            <Code2 className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2">
            {prompts.map((prompt) => (
              <li key={prompt.name} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{prompt.name}</p>
                    <p className="text-xs text-slate-400">Updated {prompt.updated} by {prompt.by}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-success-400" />
                </div>
                <p className="mt-1 text-sm text-slate-300">{prompt.summary}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                    View prompt
                  </button>
                  <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
                    Duplicate
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-amber-700/60 bg-amber-500/10 p-3 text-xs text-amber-100">
            Guardrail: all prompt/model changes must log an audit entry with actor + reason.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Evaluations</p>
              <h2 className="text-lg font-semibold text-white">Quality signals</h2>
            </div>
            <ClipboardCheck className="h-5 w-5 text-primary-200" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {evaluations.map((evalRow) => (
              <div key={evalRow.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-sm font-semibold text-white">{evalRow.name}</p>
                <p className="text-xs text-slate-400">Owner: {evalRow.owner}</p>
                <p className="mt-2 text-sm text-primary-100">{evalRow.uplift}</p>
                <p className="text-xs text-slate-400">{evalRow.samples} samples</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Run evals before changing defaults; keep rollback ready.</p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Guardrails</p>
              <h2 className="text-lg font-semibold text-white">Release checklist</h2>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Every model/prompt change writes an audit event (who/when/what/why).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Keep rollbacks one click away; default fallbacks configured per feature.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Run eval suite before switching defaults; note spend and latency impact.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
