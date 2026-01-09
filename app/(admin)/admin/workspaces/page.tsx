"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  PauseCircle,
  Search,
  Shield,
  Sparkles,
  Users2,
} from "lucide-react";

type Workspace = {
  id: string;
  company: string;
  plan: "Enterprise" | "Growth" | "Pro" | "Trial";
  seats: number;
  usage: number;
  status: "Active" | "Suspended" | "Review";
  lastActive: string;
  spend: string;
  risk?: "spend" | "quota" | "none";
};

const workspaces: Workspace[] = [
  { id: "acme-talent", company: "Acme Talent", plan: "Enterprise", seats: 28, usage: 82, status: "Active", lastActive: "2m ago", spend: "$4.8k", risk: "spend" },
  { id: "northwind", company: "Northwind", plan: "Growth", seats: 17, usage: 64, status: "Active", lastActive: "9m ago", spend: "$3.1k", risk: "quota" },
  { id: "lumina", company: "Lumina HR", plan: "Growth", seats: 11, usage: 58, status: "Active", lastActive: "21m ago", spend: "$2.5k", risk: "none" },
  { id: "nova-labs", company: "Nova Labs", plan: "Pro", seats: 9, usage: 72, status: "Review", lastActive: "14m ago", spend: "$1.9k", risk: "spend" },
  { id: "orbital", company: "Orbital", plan: "Enterprise", seats: 34, usage: 49, status: "Active", lastActive: "43m ago", spend: "$5.6k", risk: "none" },
  { id: "tallstack", company: "TallStack", plan: "Pro", seats: 6, usage: 37, status: "Suspended", lastActive: "1d ago", spend: "$0.0k", risk: "quota" },
  { id: "atlas", company: "Atlas Search", plan: "Trial", seats: 4, usage: 21, status: "Active", lastActive: "3h ago", spend: "$280", risk: "none" },
];

const planPill: Record<Workspace["plan"], string> = {
  Enterprise: "bg-primary-500/15 text-primary-100 ring-primary-500/30",
  Growth: "bg-emerald-500/15 text-emerald-100 ring-emerald-500/30",
  Pro: "bg-indigo-500/15 text-indigo-100 ring-indigo-500/30",
  Trial: "bg-amber-500/15 text-amber-100 ring-amber-500/30",
};

const statusPill: Record<Workspace["status"], string> = {
  Active: "bg-success-500/15 text-success-100",
  Suspended: "bg-danger-500/15 text-danger-100",
  Review: "bg-warning-500/15 text-warning-100",
};

export default function WorkspacesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Workspace["status"] | "All">("All");

  const filtered = useMemo(
    () =>
      workspaces.filter((workspace) => {
        const matchesQuery =
          workspace.company.toLowerCase().includes(query.toLowerCase()) ||
          workspace.id.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "All" || workspace.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [query, statusFilter],
  );

  const activeCount = workspaces.filter((w) => w.status === "Active").length;
  const suspendedCount = workspaces.filter((w) => w.status === "Suspended").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
            Workspaces
          </p>
          <h1 className="text-2xl font-semibold text-white">Tenant control center</h1>
          <p className="text-sm text-slate-400">
            Company, plan, seats, usage, and quick actions without touching the DB.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/workspaces/acme-talent"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/15"
          >
            <Sparkles className="h-4 w-4" />
            Open featured tenant
          </Link>
          <Link
            href="/admin/impersonation"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/80"
          >
            <Shield className="h-4 w-4" />
            Start impersonation (logged)
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Active workspaces"
          value={`${activeCount} / ${workspaces.length}`}
          helper="Suspended: "
          suffix={`${suspendedCount}`}
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Usage health"
          value="74% avg utilization"
          helper="Quota burn-down steady; 2 high spend tenants"
          icon={GaugePip}
        />
        <SummaryCard
          title="Risks surfaced"
          value="Spend & quota"
          helper="See watchlist rows for interventions"
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="relative w-full max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search company or workspace slug…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-10 pr-3 text-sm text-slate-100 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Active", "Suspended", "Review"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                statusFilter === status
                  ? "border-primary-500 bg-primary-500/15 text-primary-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Workspaces</p>
            <p className="text-xs text-slate-400">
              {filtered.length} of {workspaces.length} shown
            </p>
          </div>
          <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Review
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-danger-400" /> Suspended
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Workspace</th>
                <th className="px-4 py-3 text-left font-semibold">Plan</th>
                <th className="px-4 py-3 text-left font-semibold">Seats</th>
                <th className="px-4 py-3 text-left font-semibold">Usage</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Last active</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((workspace) => (
                <tr key={workspace.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-200 ring-1 ring-slate-700">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{workspace.company}</p>
                        <p className="text-xs text-slate-400">/{workspace.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${planPill[workspace.plan]}`}
                    >
                      {workspace.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">{workspace.seats}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 via-fuchsia-500 to-amber-400"
                          style={{ width: `${workspace.usage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-300">{workspace.usage}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Spend {workspace.spend}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusPill[workspace.status]}`}>
                      <StatusDot status={workspace.status} />
                      {workspace.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{workspace.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <Link
                        href={`/admin/workspaces/${workspace.id}`}
                        className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100 transition hover:bg-primary-500/15"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100 transition hover:bg-slate-800/80"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Reset API key
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-600/60 bg-amber-500/10 px-2.5 py-1 text-amber-100 transition hover:bg-amber-500/20"
                      >
                        <Users2 className="h-3.5 w-3.5" />
                        Grant credits
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-danger-600/60 bg-danger-500/10 px-2.5 py-1 text-danger-100 transition hover:bg-danger-500/20"
                      >
                        <PauseCircle className="h-3.5 w-3.5" />
                        Suspend
                      </button>
                    </div>
                    {workspace.risk && workspace.risk !== "none" ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-100">
                        <AlertTriangle className="h-3 w-3" />
                        {workspace.risk === "spend" ? "High spend" : "Quota burn accelerating"}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Workspace detail
              </p>
              <h2 className="text-lg font-semibold text-white">Overview + members + usage</h2>
              <p className="text-sm text-slate-400">
                Tabs show overview, members (role, MFA), usage, jobs, billing, integrations, settings.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary-200" />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <StatusDot status="Active" />
                Impersonate, quota override, and feature flags accessible on the header of the detail view.
              </li>
              <li className="flex items-start gap-2">
                <StatusDot status="Review" />
                Activity timeline includes API key resets, exports, and deletes with IP + admin.
              </li>
              <li className="flex items-start gap-2">
                <StatusDot status="Active" />
                Billing tab: plan, invoices, payment status, credits/refunds; Integrations tab for webhook health.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
                Controls
              </p>
              <h2 className="text-lg font-semibold text-white">Guardrails & actions</h2>
            </div>
            <Shield className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <StatusDot status="Active" />
              Suspend immediately disables API keys and background jobs, but preserves data.
            </li>
            <li className="flex items-start gap-2">
              <StatusDot status="Active" />
              Reset API key writes an audit entry with reason and actor; re-run tests on callback URL.
            </li>
            <li className="flex items-start gap-2">
              <StatusDot status="Review" />
              Credits/overrides log to billing events; limits/quota overrides show expiration.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  suffix,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  suffix?: string;
  icon: ElementType;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-white ring-1 ring-slate-700">
        <Icon className="h-5 w-5 text-primary-100" />
      </span>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-semibold text-white">{value}</span>
          {suffix ? <span className="text-xs text-slate-400">{suffix}</span> : null}
        </div>
        <p className="text-sm text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Workspace["status"] }) {
  const color =
    status === "Active" ? "bg-emerald-400" : status === "Suspended" ? "bg-danger-400" : "bg-amber-400";
  return <span className={`mt-1 h-2 w-2 rounded-full ${color}`} aria-hidden />;
}

function GaugePip() {
  return (
    <div className="flex items-center gap-1 text-primary-100">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      <span className="h-2 w-2 rounded-full bg-amber-400" />
      <span className="h-2 w-2 rounded-full bg-danger-400" />
    </div>
  );
}
