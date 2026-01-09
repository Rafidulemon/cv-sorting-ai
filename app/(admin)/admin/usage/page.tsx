import type { ReactNode } from "react";
import { AlertTriangle, BadgeCheck, BarChart3, CheckCircle2, Flame, Gauge, Layers, TrendingUp } from "lucide-react";

const dailyCost = [
  { label: "Mon", value: 420 },
  { label: "Tue", value: 398 },
  { label: "Wed", value: 440 },
  { label: "Thu", value: 512 },
  { label: "Fri", value: 536 },
  { label: "Sat", value: 360 },
  { label: "Sun", value: 318 },
];

const featureSpend = [
  { label: "Parsing", value: 118, percent: 29 },
  { label: "Scoring", value: 194, percent: 47 },
  { label: "Chat", value: 100, percent: 24 },
];

const tenantSpend = [
  { name: "Acme Talent", spend: "$4,820", feature: "Scoring heavy", alert: "Spend spike" },
  { name: "Northwind", spend: "$3,140", feature: "Parsing heavy", alert: "Cache miss" },
  { name: "Lumina HR", spend: "$2,508", feature: "Balanced", alert: "" },
  { name: "Nova Labs", spend: "$1,944", feature: "Chat heavy", alert: "Watch" },
];

const alerts = [
  { label: "Spend spike", body: "Acme Talent +28% vs baseline. Cap or optimize caching.", tone: "warning" as const },
  { label: "Cache miss spike", body: "Northwind reranking cache hit 61%. Investigate prompt variants.", tone: "warning" as const },
  { label: "Budget rule", body: "Budget stop rules ready; apply per-tenant hard caps to avoid runaway spend.", tone: "info" as const },
];

export default function UsagePage() {
  const maxCost = Math.max(...dailyCost.map((d) => d.value));
  const maxFeature = Math.max(...featureSpend.map((d) => d.value));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Usage & spend</p>
        <h1 className="text-2xl font-semibold text-white">Spend by tenant + feature</h1>
        <p className="text-sm text-slate-400">Daily trend, cost by feature, alerts for spend spikes and cache misses.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="LLM cost today" value="$412" helper="Parsing $118 · Scoring $194 · Chat $100" />
        <SummaryCard title="Month-to-date" value="$9,220" helper="+6.2% vs prior period" />
        <SummaryCard title="Cache hit rate" value="83%" helper="Reranking cache; aim > 88%" />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Daily cost trend</p>
              <h2 className="text-lg font-semibold text-white">Last 7 days</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-primary-200" />
          </div>
          <div className="flex items-end gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            {dailyCost.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-lg bg-slate-900/90 p-1 shadow-inner shadow-black/20">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary-500 via-fuchsia-500 to-amber-400"
                    style={{ height: `${(day.value / maxCost) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400">{day.label}</span>
                <span className="text-[11px] text-slate-500">${day.value}</span>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="h-4 w-4 text-primary-200" />
            Spending peaks Thu/Fri. Consider more aggressive caching + budget stop rules.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">By feature</p>
              <h2 className="text-lg font-semibold text-white">Today</h2>
            </div>
            <Layers className="h-5 w-5 text-primary-200" />
          </div>
          <div className="space-y-2">
            {featureSpend.map((row) => (
              <div key={row.label} className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{row.label}</span>
                  <span className="font-semibold text-white">${row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-fuchsia-500 to-amber-400"
                    style={{ width: `${(row.value / maxFeature) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{row.percent}% of today</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Cache misses drive scoring costs; watch hit-rate alert.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Tenants</p>
              <h2 className="text-lg font-semibold text-white">Spend + usage</h2>
            </div>
            <Gauge className="h-5 w-5 text-primary-200" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                  <th className="px-4 py-3 text-left font-semibold">Spend (30d)</th>
                  <th className="px-4 py-3 text-left font-semibold">Feature mix</th>
                  <th className="px-4 py-3 text-left font-semibold">Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {tenantSpend.map((tenant) => (
                  <tr key={tenant.name} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-white">{tenant.name}</td>
                    <td className="px-4 py-3">{tenant.spend}</td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{tenant.feature}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {tenant.alert ? (
                        <Badge tone="warning">{tenant.alert}</Badge>
                      ) : (
                        <Badge tone="success">Healthy</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Alerts</p>
              <h2 className="text-lg font-semibold text-white">Spend + cache</h2>
            </div>
            <Flame className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.label} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <Badge tone={alert.tone}>{alert.label}</Badge>
                <p className="mt-1 text-sm text-slate-200">{alert.body}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400">
            Budget stop rules: daily/monthly caps per tenant. Alert before enforcement to avoid surprises.
          </p>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function Badge({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning";
}) {
  const base =
    tone === "warning"
      ? "bg-amber-500/15 text-amber-100 ring-amber-500/30"
      : tone === "success"
        ? "bg-success-500/15 text-success-100 ring-success-500/30"
        : "bg-primary-500/15 text-primary-100 ring-primary-500/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${base}`}>
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "success" ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}
