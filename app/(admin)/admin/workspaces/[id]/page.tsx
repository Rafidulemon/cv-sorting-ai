"use client";

import type { ElementType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Gauge,
  Link2,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "usage", label: "Usage" },
  { id: "jobs", label: "Jobs" },
  { id: "billing", label: "Billing" },
  { id: "integrations", label: "Integrations" },
  { id: "settings", label: "Settings" },
] as const;

const members = [
  { name: "Nora Haynes", email: "nora@acme.io", role: "Admin", mfa: "Enforced", lastLogin: "2m ago" },
  { name: "Evan Patel", email: "evan@acme.io", role: "Support", mfa: "Enforced", lastLogin: "18m ago" },
  { name: "Priya Mondal", email: "priya@acme.io", role: "Billing", mfa: "Optional", lastLogin: "51m ago" },
  { name: "Isaac Chen", email: "isaac@acme.io", role: "Read-only", mfa: "Not enabled", lastLogin: "2d ago" },
];

const jobs = [
  { title: "Frontend Engineer", volume: 184, status: "Scoring", latency: "18s p50", failures: "0.9%" },
  { title: "Sales Lead", volume: 128, status: "Extraction", latency: "21s p50", failures: "1.2%" },
  { title: "Data Analyst", volume: 202, status: "Upload", latency: "16s p50", failures: "0.7%" },
];

const featureFlags = [
  { label: "Chat follow-ups", enabled: true, note: "Support only" },
  { label: "Bulk upload (5k CVs)", enabled: true, note: "Enterprise only" },
  { label: "PII redaction default on", enabled: false, note: "Enable for support sessions" },
  { label: "Cache bypass for testing", enabled: false, note: "Auto-off after 2h" },
];

const integrations = [
  { name: "Webhook", status: "Healthy", detail: "200 OK · 99.4% delivery" },
  { name: "ATS", status: "Pending", detail: "Waiting on API key rotation" },
  { name: "Email", status: "Healthy", detail: "DKIM/SPF good" },
];

export default function WorkspaceDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const workspaceName = useMemo(
    () =>
      params.id
        .split("-")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" "),
    [params.id],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Workspace detail</p>
          <h1 className="text-2xl font-semibold text-white">{workspaceName}</h1>
          <p className="text-sm text-slate-400">Overview, members, usage, jobs, billing, integrations, and settings.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <ActionButton icon={Sparkles} label="Impersonate (logged)" tone="primary" />
          <ActionButton icon={Gauge} label="Quota override" tone="neutral" />
          <ActionButton icon={Brain} label="Feature flags" tone="neutral" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Plan" value="Enterprise" helper="Seats: 28 · API: active" icon={Building2} />
        <StatCard title="Usage" value="82% of quota" helper="CVs processed: 5,821 (30d)" icon={Activity} />
        <StatCard title="Spend" value="$4,820 (30d)" helper="LLM cost today: $118" icon={CreditCard} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-primary-500/15 text-primary-100 ring-1 ring-primary-500/30"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {activeTab === "overview" ? <Overview /> : null}
        {activeTab === "members" ? <Members /> : null}
        {activeTab === "usage" ? <Usage /> : null}
        {activeTab === "jobs" ? <Jobs /> : null}
        {activeTab === "billing" ? <Billing /> : null}
        {activeTab === "integrations" ? <Integrations /> : null}
        {activeTab === "settings" ? <Settings /> : null}
      </section>
    </div>
  );
}

function Overview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Health</p>
            <h2 className="text-lg font-semibold text-white">Status & alerts</h2>
            <p className="text-sm text-slate-400">Service health, quotas, and recent incidents.</p>
          </div>
          <Badge tone="success">Healthy</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow icon={CheckCircle2} title="SLAs" body="Latency p95 46s, failure rate 1.2%" />
          <InfoRow icon={RefreshCw} title="Recent incidents" body="Parser schema mismatch resolved 2h ago" />
          <InfoRow icon={AlertTriangle} title="Watchlist" body="Spend spike alert enabled at +25%" />
          <InfoRow icon={Lock} title="Security" body="PII redaction available for support sessions" />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Quick actions</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/admin/audit-logs" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100">
              View audit trail
            </Link>
            <Link href="/admin/failed-documents" className="rounded-lg border border-amber-600/60 bg-amber-500/10 px-3 py-2 text-amber-100">
              Reprocess failed docs
            </Link>
            <Link href="/admin/usage" className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100">
              Usage & spend
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Impersonation</p>
            <h3 className="text-lg font-semibold text-white">Always logged</h3>
          </div>
          <Shield className="h-5 w-5 text-primary-200" />
        </div>
        <p className="text-sm text-slate-300">
          Any impersonation shows a banner in-app and pushes an audit event (actor, IP, workspace, duration).
        </p>
        <div className="rounded-xl border border-amber-700/60 bg-amber-500/10 p-3 text-xs text-amber-100">
          Warning: exports and deletes require elevated role + audit reason.
        </div>
      </div>
    </div>
  );
}

function Members() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Members</p>
          <h2 className="text-lg font-semibold text-white">Roles, MFA, last login</h2>
        </div>
        <Badge tone="info">Search by email/company</Badge>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">MFA</th>
              <th className="px-4 py-3 text-left font-semibold">Last login</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {members.map((member) => (
              <tr key={member.email} className="hover:bg-slate-900/60">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="success">{member.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={member.mfa === "Enforced" ? "success" : member.mfa === "Optional" ? "warning" : "danger"}>
                    {member.mfa}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-300">{member.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                      Revoke sessions
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
        Roles: Super Admin (all), Support Admin (view + impersonate + logs), Billing Admin (plans/invoices/credits), Read-only Auditor.
      </div>
    </div>
  );
}

function Usage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Usage</p>
            <h2 className="text-lg font-semibold text-white">Processing</h2>
          </div>
          <Badge tone="info">Real-time</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={Activity} title="CVs processed" body="2,418 today · 18 failed (1.2%)" />
          <InfoRow icon={Clock3} title="Latency" body="p50 18s · p95 46s" />
          <InfoRow icon={FileText} title="Storage" body="142 GB used · +4.3% WoW" />
          <InfoRow icon={Brain} title="LLM cost" body="$118 today · cache hit 83%" />
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Alerts</p>
            <h2 className="text-lg font-semibold text-white">Spend & failures</h2>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <ul className="space-y-2 text-sm text-slate-200">
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Spend spike threshold set to +25% daily; notifications route to billing admins.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Review" />
            Failure rate alert at 2% for OCR and parser separately; reprocess queue available.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Hard quota cap ready; currently soft cap with warnings at 90% burn-down.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Jobs() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Jobs</p>
          <h2 className="text-lg font-semibold text-white">Pipeline status</h2>
        </div>
        <Badge tone="info">Retry controls</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {jobs.map((job) => (
          <div key={job.title} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{job.title}</p>
                <p className="text-xs text-slate-400">{job.volume} CVs</p>
              </div>
              <Badge tone="success">{job.status}</Badge>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <PipelineStep label="Upload" state="done" />
              <PipelineStep label="OCR" state="done" />
              <PipelineStep label="Extraction" state={job.status === "Extraction" ? "active" : "done"} />
              <PipelineStep label="Scoring" state={job.status === "Scoring" ? "active" : "pending"} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{job.latency}</span>
              <span>{job.failures} fails</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                Retry failed
              </button>
              <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
                Open logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Billing() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Plan</p>
            <h2 className="text-lg font-semibold text-white">Enterprise</h2>
            <p className="text-sm text-slate-400">Seats: 28 · CV/month: 25k · ATS + Webhooks</p>
          </div>
          <Badge tone="success">Active</Badge>
        </div>
        <ul className="space-y-2 text-sm text-slate-200">
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Upcoming invoice: $4,820 due Feb 28 — auto-pay enabled.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Review" />
            Credits available: $600; refunds require billing admin role.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Payment failures automatically notify billing contacts + support.
          </li>
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Invoices</p>
            <h2 className="text-lg font-semibold text-white">History</h2>
          </div>
          <CreditCard className="h-5 w-5 text-primary-200" />
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
            <span>Jan</span>
            <span>$4,720 · Paid</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
            <span>Dec</span>
            <span>$4,540 · Paid</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
            <span>Nov</span>
            <span>$4,290 · Paid</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Integrations() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {integrations.map((integration) => (
        <div key={integration.name} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{integration.name}</p>
              <h3 className="text-lg font-semibold text-white">{integration.status}</h3>
            </div>
            <Link2 className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-sm text-slate-300">{integration.detail}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
              Open logs
            </button>
            <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
              Rotate secret
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Settings() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Feature flags</p>
            <h2 className="text-lg font-semibold text-white">Per-tenant overrides</h2>
          </div>
          <Badge tone="info">Live</Badge>
        </div>
        <div className="space-y-2">
          {featureFlags.map((flag) => (
            <div key={flag.label} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-white">{flag.label}</p>
                <p className="text-xs text-slate-400">{flag.note}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  flag.enabled ? "bg-success-500/15 text-success-100" : "bg-slate-800 text-slate-300"
                }`}
              >
                {flag.enabled ? "On" : "Off"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Retention</p>
            <h2 className="text-lg font-semibold text-white">Compliance</h2>
          </div>
          <Badge tone="warning">PII</Badge>
        </div>
        <ul className="space-y-2 text-sm text-slate-200">
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Data retention 180 days; override allowed with explicit audit reason.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Review" />
            GDPR delete requests tracked in Compliance tab; exports logged with IP.
          </li>
          <li className="flex items-start gap-2">
            <StatusDot status="Active" />
            Two-person rule optional for exports and deletes (toggleable).
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-white ring-1 ring-slate-700">
        <Icon className="h-5 w-5 text-primary-100" />
      </span>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className="text-sm text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  body,
}: {
  icon: ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-primary-100 ring-1 ring-slate-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-300">{body}</p>
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
      {tone === "warning" ? <AlertTriangle className="h-3 w-3" /> : tone === "danger" ? <AlertTriangle className="h-3 w-3" /> : tone === "success" ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}

function StatusDot({ status }: { status: "Active" | "Suspended" | "Review" }) {
  const color = status === "Active" ? "bg-emerald-400" : status === "Suspended" ? "bg-danger-400" : "bg-amber-400";
  return <span className={`mt-1 h-2 w-2 rounded-full ${color}`} aria-hidden />;
}

function PipelineStep({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "pending";
}) {
  const tone =
    state === "done" ? "bg-emerald-500/15 text-emerald-100" : state === "active" ? "bg-primary-500/15 text-primary-100" : "bg-slate-800 text-slate-300";
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${tone}`}>
      <span>{label}</span>
      {state === "done" ? <CheckCircle2 className="h-4 w-4" /> : state === "active" ? <Activity className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-slate-500" aria-hidden />}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  tone,
}: {
  icon: ElementType;
  label: string;
  tone: "primary" | "neutral";
}) {
  const classes =
    tone === "primary"
      ? "border-primary-500/50 bg-primary-500/10 text-primary-100 hover:bg-primary-500/15"
      : "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-800/80";
  return (
    <button className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 transition ${classes}`} type="button">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
