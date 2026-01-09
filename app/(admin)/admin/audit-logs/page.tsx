"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ActivitySquare,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  FileOutput,
  Gavel,
  Shield,
  UserRound,
} from "lucide-react";

type Log = {
  admin: string;
  workspace: string;
  action: string;
  type: "impersonation" | "delete" | "export" | "quota" | "billing" | "other";
  time: string;
  ip: string;
};

const logs: Log[] = [
  { admin: "Riley Chen", workspace: "Acme Talent", action: "Impersonation started (support)", type: "impersonation", time: "2m ago", ip: "10.2.1.4" },
  { admin: "Nadia Lee", workspace: "Acme Talent", action: "Quota override to 25k CVs", type: "quota", time: "7m ago", ip: "10.2.1.9" },
  { admin: "Priya Mondal", workspace: "Northwind", action: "Refund issued: $220", type: "billing", time: "18m ago", ip: "10.2.2.5" },
  { admin: "Samir Patel", workspace: "Nova Labs", action: "Exported CV bundle (PII redacted)", type: "export", time: "23m ago", ip: "10.2.3.1" },
  { admin: "Amina Rahman", workspace: "Lumina HR", action: "Deleted job: Data Analyst", type: "delete", time: "41m ago", ip: "10.2.4.3" },
  { admin: "Riley Chen", workspace: "Northwind", action: "API key rotated", type: "other", time: "1h ago", ip: "10.2.1.4" },
];

export default function AuditLogsPage() {
  const [adminFilter, setAdminFilter] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<Log["type"] | "All">("All");

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        const matchesAdmin = log.admin.toLowerCase().includes(adminFilter.toLowerCase());
        const matchesWorkspace = log.workspace.toLowerCase().includes(workspaceFilter.toLowerCase());
        const matchesType = typeFilter === "All" || log.type === typeFilter;
        return matchesAdmin && matchesWorkspace && matchesType;
      }),
    [adminFilter, workspaceFilter, typeFilter],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Audit</p>
          <h1 className="text-2xl font-semibold text-white">Audit logs</h1>
          <p className="text-sm text-slate-400">Filter by admin, workspace, action type. Impersonation shows a banner + always logs.</p>
        </div>
        <Badge tone="info">Every action logged</Badge>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur md:grid-cols-3">
        <FilterInput label="Admin" placeholder="Search admin…" value={adminFilter} onChange={setAdminFilter} />
        <FilterInput label="Workspace" placeholder="Search workspace…" value={workspaceFilter} onChange={setWorkspaceFilter} />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Action type</p>
          <select
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as Log["type"] | "All")}
          >
            {["All", "impersonation", "delete", "export", "quota", "billing", "other"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Log entries</p>
            <p className="text-xs text-slate-400">
              {filtered.length} of {logs.length} events
            </p>
          </div>
          <Badge tone="warning">PII redaction toggle supported</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Admin</th>
                <th className="px-4 py-3 text-left font-semibold">Workspace</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((log) => (
                <tr key={`${log.admin}-${log.time}-${log.action}`} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{log.admin}</td>
                  <td className="px-4 py-3 text-primary-100">{log.workspace}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">
                    <Badge tone={log.type === "impersonation" ? "warning" : log.type === "delete" ? "danger" : log.type === "export" ? "info" : "success"}>
                      {log.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.time}</td>
                  <td className="px-4 py-3 text-slate-300">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Callout
          icon={Shield}
          title="Impersonation"
          body="Banner shows in-product; actor, IP, workspace, duration logged. Support Admin only."
          pill="Critical"
        />
        <Callout
          icon={FileOutput}
          title="Exports & deletes"
          body="Exports and deletes require elevated role (or two-person rule). Audit stores reason + IP."
          pill="Sensitive"
        />
        <Callout
          icon={Gavel}
          title="Policy"
          body="Quota changes, billing changes, and refunds are logged with before/after values."
          pill="Guardrail"
        />
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
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "danger" ? <ActivitySquare className="h-3 w-3" /> : tone === "success" ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}

function FilterInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-slate-500"
      />
    </div>
  );
}

function Callout({
  icon: Icon,
  title,
  body,
  pill,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
  pill: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-primary-100 ring-1 ring-slate-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{pill}</p>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>
        <UserRound className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-sm text-slate-300">{body}</p>
    </div>
  );
}
