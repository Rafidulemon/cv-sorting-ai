"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, EyeOff, Lock, Mail, Search, Shield, Users2 } from "lucide-react";

type User = {
  name: string;
  email: string;
  workspace: string;
  role: "Super Admin" | "Support Admin" | "Billing Admin" | "Read-only Auditor";
  mfa: "Enforced" | "Optional" | "Not enabled";
  lastLogin: string;
  status: "Active" | "Disabled";
};

const users: User[] = [
  { name: "Amina Rahman", email: "amina@acme.io", workspace: "Acme Talent", role: "Super Admin", mfa: "Enforced", lastLogin: "3m ago", status: "Active" },
  { name: "Riley Chen", email: "riley@northwind.com", workspace: "Northwind", role: "Support Admin", mfa: "Enforced", lastLogin: "11m ago", status: "Active" },
  { name: "Priya Mondal", email: "priya@acme.io", workspace: "Acme Talent", role: "Billing Admin", mfa: "Optional", lastLogin: "1h ago", status: "Active" },
  { name: "Samir Patel", email: "samir@lumina.hr", workspace: "Lumina HR", role: "Read-only Auditor", mfa: "Not enabled", lastLogin: "1d ago", status: "Active" },
  { name: "Noah Evans", email: "noah@novalabs.ai", workspace: "Nova Labs", role: "Support Admin", mfa: "Optional", lastLogin: "3d ago", status: "Disabled" },
];

const rolePill: Record<User["role"], string> = {
  "Super Admin": "bg-primary-500/15 text-primary-100 ring-primary-500/30",
  "Support Admin": "bg-emerald-500/15 text-emerald-100 ring-emerald-500/30",
  "Billing Admin": "bg-amber-500/15 text-amber-100 ring-amber-500/30",
  "Read-only Auditor": "bg-slate-800 text-slate-200 ring-slate-700",
};

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "All">("All");

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery =
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.workspace.toLowerCase().includes(query.toLowerCase()) ||
          user.name.toLowerCase().includes(query.toLowerCase());
        const matchesRole = roleFilter === "All" || user.role === roleFilter;
        return matchesQuery && matchesRole;
      }),
    [query, roleFilter],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Users</p>
          <h1 className="text-2xl font-semibold text-white">Directory</h1>
          <p className="text-sm text-slate-400">Search by email/company, check roles, MFA, and revoke sessions fast.</p>
        </div>
        <Link
          href="/admin/audit-logs"
          className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/15"
        >
          <Shield className="h-4 w-4" />
          Open audit logs
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="relative w-full max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search email, name, or workspace…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-10 pr-3 text-sm text-slate-100 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Super Admin", "Support Admin", "Billing Admin", "Read-only Auditor"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                roleFilter === role
                  ? "border-primary-500 bg-primary-500/15 text-primary-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Users</p>
            <p className="text-xs text-slate-400">
              {filtered.length} of {users.length} shown
            </p>
          </div>
          <Badge tone="warning">MFA coverage</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Workspace</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">MFA</th>
                <th className="px-4 py-3 text-left font-semibold">Last login</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((user) => (
                <tr key={user.email} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-200 ring-1 ring-slate-700">
                        <Users2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/workspaces/${user.workspace.toLowerCase().replace(/\s+/g, "-")}`} className="text-primary-100 underline-offset-2 hover:underline">
                      {user.workspace}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${rolePill[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.mfa === "Enforced" ? "success" : user.mfa === "Optional" ? "warning" : "danger"}>
                      {user.mfa}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                        Revoke sessions
                      </button>
                      <button className="rounded-lg border border-amber-600/60 bg-amber-500/10 px-2.5 py-1 text-amber-100" type="button">
                        Force MFA
                      </button>
                      <button className="rounded-lg border border-danger-600/60 bg-danger-500/10 px-2.5 py-1 text-danger-100" type="button">
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Callout
          icon={Lock}
          title="Security controls"
          body="Revoke sessions, force MFA, reset password. Tracks actor, IP, timestamp."
          pill="MFA enforcement"
        />
        <Callout
          icon={BadgeCheck}
          title="Core roles"
          body="Super Admin, Support Admin (view + impersonate + logs), Billing Admin (plans/invoices/credits), Read-only Auditor."
          pill="Access"
        />
      </div>
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
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "danger" ? <EyeOff className="h-3 w-3" /> : tone === "success" ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}

function Callout({
  icon: Icon,
  title,
  body,
  pill,
}: {
  icon: ElementType;
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
        <Mail className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-sm text-slate-300">{body}</p>
    </div>
  );
}
