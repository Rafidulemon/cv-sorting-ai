"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Download,
  Globe2,
  KeyRound,
  Lock,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import ChangePasswordModal from "@/app/components/modals/ChangePasswordModal";

type SettingItem = {
  title: string;
  description: string;
  status: string;
  tone?: "positive" | "warning" | "neutral";
  icon: LucideIcon;
};

const toneClasses: Record<NonNullable<SettingItem["tone"]>, string> = {
  positive: "bg-primary-50 text-primary-700",
  warning: "bg-[#fff4e5] text-[#b45309]",
  neutral: "bg-[#eef2f7] text-[#55607a]",
};

const securityControls: SettingItem[] = [
  {
    title: "Multi-factor authentication",
    description: "Enforce OTP for every login and sensitive action.",
    status: "Enabled",
    tone: "positive",
    icon: ShieldCheck,
  },
  {
    title: "New device approvals",
    description: "Manual review required for first-time browsers or devices.",
    status: "2 pending",
    tone: "warning",
    icon: KeyRound,
  },
  {
    title: "Session timeout",
    description: "Auto-lock after inactivity and regenerate tokens.",
    status: "12h window",
    tone: "neutral",
    icon: Lock,
  },
];

const notificationPrefs: SettingItem[] = [
  {
    title: "Pipeline updates",
    description: "Shortlist ready, stalled uploads, and job health alerts.",
    status: "Push + email",
    tone: "positive",
    icon: Bell,
  },
  {
    title: "Security alerts",
    description: "New devices, failed MFA, permission escalations.",
    status: "Critical only",
    tone: "warning",
    icon: AlertTriangle,
  },
  {
    title: "Product tips",
    description: "Feature releases and best-practice nudges.",
    status: "Weekly digest",
    tone: "neutral",
    icon: Sparkles,
  },
];

const workspaceDefaults: SettingItem[] = [
  {
    title: "Default landing",
    description: "Where your team starts after login.",
    status: "Dashboard overview",
    tone: "neutral",
    icon: Globe2,
  },
  {
    title: "AI assistance level",
    description: "How proactive carriX should be with scoring tips.",
    status: "Guided (recommended)",
    tone: "positive",
    icon: CheckCircle2,
  },
  {
    title: "Theme + contrast",
    description: "Interface accents, motion, and density presets.",
    status: "Luminous",
    tone: "neutral",
    icon: Palette,
  },
];

const dataControls: SettingItem[] = [
  {
    title: "Data retention",
    description: "Auto-delete archived resumes and logs after a set window.",
    status: "180 days",
    tone: "neutral",
    icon: Database,
  },
  {
    title: "Exports",
    description: "CSV + JSON with scoring rationales and signals.",
    status: "Ready",
    tone: "positive",
    icon: Download,
  },
];

export default function SettingsPage() {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <div className="space-y-8 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-white via-[#fbf8ff] to-white p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-3rem] top-[-2rem] h-48 w-48 rounded-full bg-[#e2e7ff] blur-3xl" />
          <div className="absolute right-[-2rem] bottom-[-3rem] h-52 w-52 rounded-full bg-[#ffe6f2] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Settings
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">
                Tune your workspace and guard access
              </h1>
              <p className="max-w-2xl text-sm text-[#6b718b]">
                Control identity, notifications, and data policies for your team. Changes apply instantly across
                dashboard, uploads, and collaboration surfaces.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(216,8,128,0.6)] transition hover:translate-y-[-2px]"
              >
                Edit profile & team
              </Link>
              <Link
                href="/credits"
                className="inline-flex items-center justify-center rounded-xl border border-[#efe7f5] bg-white px-4 py-2 text-sm font-semibold text-[#5c6175] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600"
              >
                Plan & billing
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_26px_70px_-42px_rgba(82,66,139,0.4)] backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6f1ff] via-white to-[#fff5fb]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Workspace</p>
                  <p className="text-lg font-semibold text-[#1f2a44]">carriX scale</p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  Healthy
                </span>
              </div>
              <div className="space-y-2 rounded-2xl border border-[#efe7f5] bg-white/70 p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1f2a44]">Security posture</p>
                  <p className="text-sm font-semibold text-[#1f2a44]">92%</p>
                </div>
                <div className="h-2 rounded-full bg-[#f0e8f7]">
                  <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292] shadow-[0_10px_25px_-18px_rgba(124,94,171,0.65)]" />
                </div>
                <p className="text-xs text-[#8a90a6]">MFA enforced · device reviews pending · audit log enabled</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#efe7f5] bg-white px-4 py-3 text-sm font-semibold text-[#1f2a44] shadow-sm">
                  Time zone <span className="block text-xs font-normal text-[#6b718b]">GMT+6 Dhaka</span>
                </div>
                <div className="rounded-xl border border-[#efe7f5] bg-white px-4 py-3 text-sm font-semibold text-[#1f2a44] shadow-sm">
                  Data region <span className="block text-xs font-normal text-[#6b718b]">EU (Frankfurt)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f2a44]">Identity & access</p>
                <p className="text-xs text-[#6b718b]">Lock down how teammates sign in and access sensitive data.</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-sm font-semibold text-primary-600 transition hover:text-primary-500"
            >
              Manage team
            </Link>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-primary-600">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f2a44]">Change password</p>
                <p className="text-xs text-[#6b718b]">Update your login password to keep access secure.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setIsPasswordOpen(true)}>
              Change password
            </Button>
          </div>

          <div className="space-y-3">
            {securityControls.map((item) => {
              const Icon = item.icon;
              const badgeClass = toneClasses[item.tone ?? "neutral"];
              return (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f7f2ff] text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1f2a44]">{item.title}</p>
                      <p className="text-xs text-[#6b718b]">{item.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Notifications</p>
              <p className="text-xs text-[#6b718b]">Keep the right people in the loop about jobs and security.</p>
            </div>
          </div>

          <div className="space-y-3">
            {notificationPrefs.map((item) => {
              const Icon = item.icon;
              const badgeClass = toneClasses[item.tone ?? "neutral"];
              return (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3f6ff] text-[#3D64FF]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1f2a44]">{item.title}</p>
                      <p className="text-xs text-[#6b718b]">{item.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(216,8,128,0.6)] transition hover:translate-y-[-2px]"
            >
              Save notification rules
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-[#efe7f5] bg-white px-4 py-2 text-sm font-semibold text-[#5c6175] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600"
            >
              Silence non-critical alerts
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Workspace defaults</p>
              <p className="text-xs text-[#6b718b]">Guide how your team lands, collaborates, and sees AI help.</p>
            </div>
          </div>

          <div className="space-y-3">
            {workspaceDefaults.map((item) => {
              const Icon = item.icon;
              const badgeClass = toneClasses[item.tone ?? "neutral"];
              return (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f7f2ff] text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1f2a44]">{item.title}</p>
                      <p className="text-xs text-[#6b718b]">{item.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff4e6] text-[#b45309]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Data & privacy</p>
              <p className="text-xs text-[#6b718b]">Control retention, exports, and privacy requests.</p>
            </div>
          </div>

          <div className="space-y-3">
            {dataControls.map((item) => {
              const Icon = item.icon;
              const badgeClass = toneClasses[item.tone ?? "neutral"];
              return (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff7ec] text-[#b45309]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1f2a44]">{item.title}</p>
                      <p className="text-xs text-[#6b718b]">{item.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(124,94,171,0.6)] transition hover:translate-y-[-2px]"
            >
              Export audit log
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-[#f3d9da] bg-[#fff7f8] px-4 py-2 text-sm font-semibold text-[#b42318] shadow-sm transition hover:-translate-y-0.5 hover:border-[#f1c3c2] hover:text-[#9f1b16]"
            >
              Submit deletion request
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff4f8] text-[#d80880]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Automation lanes</p>
              <p className="text-xs text-[#6b718b]">Draft actions carriX can auto-run when uploads finish.</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-[#efe7f5] bg-white px-4 py-2 text-sm font-semibold text-[#5c6175] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600"
          >
            Edit automation
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[
            "Notify hiring manager when shortlist is ready",
            "Tag candidates by skill seniority",
            "Post top 5 matches to Slack channel",
          ].map((action) => (
            <div
              key={action}
              className="flex items-start gap-3 rounded-2xl border border-[#f0e8f7] bg-white/80 p-4 shadow-sm"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-[#1f2a44]">{action}</p>
            </div>
          ))}
        </div>
      </section>

      <ChangePasswordModal open={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}
