import type { ElementType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart,
  Brain,
  Building2,
  CheckCircle2,
  Database,
  FileWarning,
  Gauge,
  LineChart,
  Shield,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  change: { value: string; direction: "up" | "down"; note?: string };
  icon: ElementType;
  accent: string;
};

type AttentionCard = {
  title: string;
  body: string;
  badge: string;
  tone: "warning" | "danger" | "info";
  cta: string;
  href: string;
};

const metrics: MetricCard[] = [
  {
    label: "Active workspaces (7d)",
    value: "128",
    helper: "72% with API activity",
    change: { value: "+4.8%", direction: "up", note: "vs last week" },
    icon: Building2,
    accent:
      "from-primary-900/60 via-primary-800/50 to-primary-700/40 border-primary-700/60 text-primary-50",
  },
  {
    label: "CVs processed (today)",
    value: "2,418",
    helper: "Failures at 1.2%",
    change: { value: "+12.3%", direction: "up", note: "vs yesterday" },
    icon: Gauge,
    accent: "from-slate-900 via-slate-800/70 to-primary-800/40 border-slate-700/80 text-slate-50",
  },
  {
    label: "Failed docs (24h)",
    value: "18",
    helper: "Parser: 7 · OCR: 6 · LLM: 5",
    change: { value: "-0.4%", direction: "down", note: "trend improving" },
    icon: FileWarning,
    accent:
      "from-amber-950/60 via-slate-900 to-slate-900 border-amber-800/60 text-amber-100",
  },
  {
    label: "Avg processing time",
    value: "18s / 46s",
    helper: "p50 / p95 end-to-end",
    change: { value: "-9.1%", direction: "down", note: "vs last 7d" },
    icon: Timer,
    accent:
      "from-emerald-950/60 via-emerald-900/50 to-slate-900 border-emerald-800/60 text-emerald-100",
  },
  {
    label: "LLM cost (today)",
    value: "$412",
    helper: "Parsing $118 · Scoring $194 · Chat $100",
    change: { value: "-3.0%", direction: "down", note: "vs yesterday" },
    icon: Brain,
    accent:
      "from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-800/60 text-indigo-100",
  },
  {
    label: "MRR / MTD",
    value: "$42.3k",
    helper: "MTD $61.8k · +6.2% expansion",
    change: { value: "+6.2%", direction: "up", note: "net revenue" },
    icon: Wallet,
    accent:
      "from-fuchsia-950/70 via-slate-900 to-slate-900 border-fuchsia-800/60 text-fuchsia-100",
  },
];

const cvVolume7d = [
  { label: "Mon", value: 2100 },
  { label: "Tue", value: 2418 },
  { label: "Wed", value: 2322 },
  { label: "Thu", value: 2512 },
  { label: "Fri", value: 2476 },
  { label: "Sat", value: 1806 },
  { label: "Sun", value: 1624 },
];

const cvVolume30d = [
  { label: "Week 1", value: 13642 },
  { label: "Week 2", value: 14518 },
  { label: "Week 3", value: 15224 },
  { label: "Week 4", value: 14892 },
];

const costByFeature = [
  { label: "Parsing", value: 118, percent: 29, color: "from-cyan-500/90 to-cyan-400/70" },
  { label: "Scoring", value: 194, percent: 47, color: "from-violet-500/90 to-fuchsia-500/70" },
  { label: "Chat", value: 100, percent: 24, color: "from-amber-400/90 to-orange-500/70" },
];

const attention: AttentionCard[] = [
  {
    title: "Failed documents need triage",
    body: "18 failed docs in the last 24h (OCR drift + parser schema mismatch).",
    badge: "Operational",
    tone: "danger",
    cta: "Open failure center",
    href: "/admin/failed-documents",
  },
  {
    title: "Payments failing for 3 tenants",
    body: "Cards declined for Nova Labs, TallStack, and Orbital. Retry + reach out.",
    badge: "Billing",
    tone: "warning",
    cta: "Review payments",
    href: "/admin/payments",
  },
  {
    title: "High spend tenants",
    body: "Acme Talent and Northwind exceeded daily budget. Consider cache tweaks or caps.",
    badge: "Spend",
    tone: "info",
    cta: "View usage & spend",
    href: "/admin/usage",
  },
];

const activity = [
  {
    workspace: "Acme Talent",
    action: "Quota override to 25k CVs",
    actor: "Riley (Super Admin)",
    status: "Completed",
    time: "2m ago",
  },
  {
    workspace: "Northwind",
    action: "Impersonation started (logged)",
    actor: "Nadia (Support)",
    status: "Noted",
    time: "9m ago",
  },
  {
    workspace: "Lumina HR",
    action: "Reprocessed 12 failed docs",
    actor: "Sam (Ops)",
    status: "Completed",
    time: "21m ago",
  },
  {
    workspace: "Nova Labs",
    action: "Payment retry scheduled",
    actor: "Priya (Billing)",
    status: "Pending",
    time: "32m ago",
  },
];

const topTenants = [
  { name: "Acme Talent", spend: "$4,820", cv: 5821, growth: "+18%", plan: "Enterprise" },
  { name: "Northwind", spend: "$3,140", cv: 4116, growth: "+9%", plan: "Growth" },
  { name: "Lumina HR", spend: "$2,508", cv: 3624, growth: "+12%", plan: "Growth" },
  { name: "Nova Labs", spend: "$1,944", cv: 2880, growth: "-3%", plan: "Pro" },
];

const guardrails = [
  "Impersonation triggers a banner and audit log entry.",
  "Every admin action (quota, billing, deletes, exports) is logged with actor + IP.",
  "Support view has PII redaction toggle; exports require elevated role.",
  "Budget stop rules ready for rollout once caps are set per tenant.",
];

export default function AdminOverviewPage() {
  const maxVolume7d = Math.max(...cvVolume7d.map((d) => d.value));
  const maxVolume30d = Math.max(...cvVolume30d.map((d) => d.value));
  const maxCost = Math.max(...costByFeature.map((d) => d.value));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${metric.accent} px-4 py-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)]`}
          >
            <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-white/5 blur-3xl transition duration-300 group-hover:blur-[50px]" />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">{metric.value}</span>
                  <ChangePill change={metric.change} />
                </div>
                <p className="text-sm text-slate-300">{metric.helper}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                <metric.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                CV volume
              </p>
              <h2 className="text-lg font-semibold text-white">7d trend + 30d rollup</h2>
              <p className="text-sm text-slate-400">Spot spikes before queues back up.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1">
                <span className="h-2 w-6 rounded-full bg-gradient-to-r from-primary-400 to-fuchsia-400" />
                Last 7 days
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1">
                <span className="h-2 w-6 rounded-full bg-gradient-to-r from-slate-500 to-slate-300" />
                30d rollup
              </span>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="flex items-end gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                {cvVolume7d.map((point) => (
                  <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end rounded-lg bg-slate-900/90 p-1 shadow-inner shadow-black/20">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-primary-500 via-fuchsia-500 to-white"
                        style={{ height: `${(point.value / maxVolume7d) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{point.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <LineChart className="h-4 w-4 text-primary-300" />
                Throughput steady; watch Friday spikes to pre-warm scoring workers.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    30d rollup
                  </p>
                  <p className="text-sm text-slate-300">Volume by week</p>
                </div>
                <Sparkles className="h-4 w-4 text-primary-200" />
              </div>
              <div className="space-y-2">
                {cvVolume30d.map((point) => (
                  <div key={point.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{point.label}</span>
                      <span className="font-semibold text-white">{point.value.toLocaleString()} CVs</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 via-fuchsia-500 to-amber-400"
                        style={{ width: `${(point.value / maxVolume30d) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
                Focus: keep failure rate &lt;2% while scaling Friday bursts; pre-warm OCR + scoring pools.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Cost by feature
              </p>
              <h2 className="text-lg font-semibold text-white">LLM spend (today)</h2>
              <p className="text-sm text-slate-400">Parsing vs scoring vs chat.</p>
            </div>
            <BarChart className="h-5 w-5 text-primary-200" />
          </header>
          <div className="space-y-3">
            {costByFeature.map((row) => (
              <div key={row.label} className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-8 rounded-full bg-gradient-to-r ${row.color}`} />
                    <span>{row.label}</span>
                  </div>
                  <span className="font-semibold text-white">${row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                    style={{ width: `${(row.value / maxCost) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{row.percent}% of today&apos;s spend</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-primary-900/50 bg-primary-950/50 p-3 text-sm text-primary-100">
            <Sparkles className="h-4 w-4" />
            Cache hit rate 83%; bump reranking cache to shave 6-8% off scoring spend.
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Attention required
              </p>
              <h2 className="text-lg font-semibold text-white">Ops + Billing</h2>
              <p className="text-sm text-slate-400">Keep incidents and leakage low.</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success-400" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {attention.map((item) => (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-4"
              >
                <Badge tone={item.tone}>{item.badge}</Badge>
                <div className="mt-3 space-y-2">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-300">{item.body}</p>
                </div>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-200 transition hover:text-primary-100"
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/5 blur-3xl transition duration-300 group-hover:blur-[46px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Guardrails
              </p>
              <h2 className="text-lg font-semibold text-white">Security & audit</h2>
            </div>
            <Shield className="h-5 w-5 text-primary-200" />
          </header>
          <ul className="space-y-3">
            {guardrails.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Impersonation sessions always show a banner and push to audit log.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Activity stream
              </p>
              <h2 className="text-lg font-semibold text-white">Latest admin actions</h2>
            </div>
            <Activity className="h-5 w-5 text-primary-200" />
          </header>
          <div className="divide-y divide-slate-800">
            {activity.map((item) => (
              <div key={item.action} className="flex items-start gap-3 py-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-white">{item.workspace}</p>
                  <p className="text-sm text-slate-300">{item.action}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{item.actor}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span>{item.time}</span>
                    <Badge tone="info">{item.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-200 transition hover:text-primary-100"
          >
            View audit logs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Top tenants
              </p>
              <h2 className="text-lg font-semibold text-white">Usage & spend leaders</h2>
            </div>
            <Database className="h-5 w-5 text-primary-200" />
          </header>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">CVs (30d)</th>
                  <th className="px-4 py-3 text-left font-semibold">Spend (30d)</th>
                  <th className="px-4 py-3 text-left font-semibold">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {topTenants.map((tenant) => (
                  <tr key={tenant.name} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-white">{tenant.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{tenant.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">{tenant.cv.toLocaleString()}</td>
                    <td className="px-4 py-3">{tenant.spend}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          tenant.growth.startsWith("-")
                            ? "bg-danger-500/15 text-danger-100"
                            : "bg-success-500/15 text-success-100"
                        }`}
                      >
                        {tenant.growth.startsWith("-") ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {tenant.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <Badge tone="info">Watchlist</Badge>
            Nova Labs trending down; enable budget stop rules and surface cache hit diagnostics.
          </div>
        </div>
      </section>
    </div>
  );
}

function ChangePill({ change }: { change: MetricCard["change"] }) {
  const tone =
    change.direction === "up"
      ? "bg-success-500/15 text-success-100 ring-success-500/30"
      : "bg-amber-500/15 text-amber-100 ring-amber-500/30";
  const Icon = change.direction === "up" ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone}`}>
      <Icon className="h-3 w-3" />
      {change.value}
      {change.note ? <span className="text-[11px] font-normal text-slate-200/90">{change.note}</span> : null}
    </span>
  );
}

function Badge({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning" | "danger";
}) {
  const base =
    tone === "warning"
      ? "bg-amber-500/15 text-amber-100 ring-amber-500/30"
      : tone === "danger"
        ? "bg-danger-500/15 text-danger-100 ring-danger-500/30"
        : "bg-primary-500/15 text-primary-100 ring-primary-500/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${base}`}>
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "danger" ? <FileWarning className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}
