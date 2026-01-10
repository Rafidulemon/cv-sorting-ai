"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCircle2,
  Globe2,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";

const defaultProfile = {
  name: "Md. Rafidul Islam",
  title: "Head of Talent Ops",
  team: "Talent Intelligence · carriX Labs",
  email: "rafid.carriastic@gmail.com",
  phone: "+880 1700 123 456",
  location: "Dhaka, Bangladesh",
  timezone: "GMT+6 · Dhaka",
  workspaceUrl: "carrix.com/rafidul-team",
  bio: "Guiding teams to shortlist faster with carriX. Loves clean pipelines, strong signals, and good coffee.",
  status: "Active",
  lastActive: "Active · 2m ago",
  startDate: "Joined Jan 2024",
  image: "/images/default_dp.png",
};

const formatRoleLabel = (value?: string | null) => {
  if (!value) return "Company admin";
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super admin",
    COMPANY_ADMIN: "Company admin",
    COMPANY_MEMBER: "Member",
    VIEWER: "Viewer",
  };
  return map[value] ?? value;
};

const usageHighlights = [
  { label: "Uploads reviewed", value: "312", helper: "This month", icon: UploadCloud },
  { label: "Shortlists shared", value: "18", helper: "Hiring managers looped in", icon: Sparkles },
  { label: "Plan status", value: "Scale", helper: "Advanced scoring enabled", icon: ShieldCheck },
];

const notificationPreferences = [
  {
    title: "Weekly talent digest",
    description: "Curated report of shortlisted candidates and pipeline health.",
    enabled: true,
  },
  {
    title: "Processing alerts",
    description: "Instant notifications when a job finishes sorting or encounters an issue.",
    enabled: true,
  },
  {
    title: "Insights & experiments",
    description: "Early access announcements and optimisation suggestions from the AI.",
    enabled: false,
  },
];

const planFeatures = [
  "Unlimited job descriptions with AI assisted drafting.",
  "Advanced semantic scoring and bias mitigation controls.",
  "Priority support with a dedicated talent advisor.",
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  const profile = {
    ...defaultProfile,
    name: session?.user?.name ?? defaultProfile.name,
    email: session?.user?.email ?? defaultProfile.email,
    image:
      session?.user?.image && session.user.image.trim().length
        ? session.user.image
        : defaultProfile.image,
  };
  const profileAvatar = profile.image?.trim().length ? profile.image : defaultProfile.image;
  const profileInitial = (profile.name || "U").charAt(0).toUpperCase();
  const seatType = formatRoleLabel(sessionRole);
  const personalDetails = [
    { label: "Full name", value: profile.name },
    { label: "Title", value: profile.title },
    { label: "Team", value: profile.team },
    { label: "Location", value: profile.location },
  ];

  const contactDetails = [
    { label: "Work email", value: profile.email, icon: Mail },
    { label: "Phone", value: profile.phone, icon: Phone },
    { label: "Workspace URL", value: profile.workspaceUrl, icon: Link2 },
    { label: "Timezone", value: profile.timezone, icon: Globe2 },
  ];

  const workspaceInsights = [
    { label: "Seat type", value: seatType, helper: "Controls access & billing" },
    { label: "Member since", value: profile.startDate, helper: "1 year of tenure" },
    { label: "Last active", value: profile.lastActive, helper: "Session monitored for security" },
  ];

  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-10 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 right-12 h-60 w-60 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
              <Sparkles className="h-4 w-4" />
              Profile
            </span>
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#DCE0E0] bg-gradient-to-br from-[#3D64FF] to-[#f06292] text-xl font-semibold text-white shadow-[0_22px_40px_-28px_rgba(61,100,255,0.8)] lg:h-20 lg:w-20">
                <span className="absolute inset-0 grid place-items-center text-white">{profileInitial}</span>
                <Image
                  src={profileAvatar}
                  alt={`${profile.name} avatar`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
                    {profile.name}
                  </h1>
                  <p className="text-sm font-semibold text-[#4B5563] lg:text-base">
                    {profile.title} · {profile.team}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#4B5563]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f0ff] px-3 py-1 text-[#3D64FF]">
                    <Globe2 className="h-3.5 w-3.5" />
                    {profile.timezone}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4f8] px-3 py-1 text-[#d80880]">
                    <UserRound className="h-3.5 w-3.5" />
                    {profile.status}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3 py-1 text-[#4B5563]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                    {profile.lastActive}
                  </span>
                </div>
              </div>
            </div>

            <p className="max-w-3xl text-sm text-[#4B5563] lg:text-base">{profile.bio}</p>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D64FF] to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(61,100,255,0.6)] transition hover:translate-y-[-2px]">
                Edit profile
              </button>
              <button className="inline-flex items-center justify-center rounded-xl border border-[#DCE0E0] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3D64FF]/50 hover:text-[#3D64FF]">
                Share profile
              </button>
              <button className="inline-flex items-center justify-center rounded-xl border border-[#3D64FF]/30 bg-[#3D64FF]/10 px-4 py-2 text-sm font-semibold text-[#3D64FF] shadow-sm transition hover:bg-[#3D64FF]/15">
                <UploadCloud className="mr-2 h-4 w-4" />
                Download profile
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[#3D64FF]/12 blur-3xl" />
              <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-[#fff4f8] blur-2xl" />
            </div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#181B31]">User information</p>
                    <p className="text-xs text-[#6B7280]">Contact, identity, and workspace signals.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f5ec] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#15803d]">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#4B5563]">
                  <p>Profile completeness</p>
                  <p>92%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#3D64FF] to-[#f06292] shadow-[0_10px_24px_-18px_rgba(61,100,255,0.6)]" />
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">Last updated 2 days ago</p>
              </div>

              <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-[#3D64FF]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                        <p className="font-semibold text-[#181B31]">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-[#3D64FF]/12 blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#181B31]">Profile details</p>
                    <p className="text-xs text-[#6B7280]">Who you are and how teammates find you.</p>
                  </div>
                </div>
                <button className="rounded-xl border border-[#DCE0E0] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/10">
                  Update info
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {personalDetails.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#181B31]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-[#3D64FF]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-[#181B31]">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-[#ffe6f2] blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff4f8] text-[#d80880]">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#181B31]">Access & workspace</p>
                    <p className="text-xs text-[#6B7280]">Permissions, region, and plan signals.</p>
                  </div>
                </div>
                <button className="rounded-xl border border-[#DCE0E0] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#d80880] transition hover:border-[#d80880]/40 hover:bg-[#fff4f8]">
                  Workspace settings
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {workspaceInsights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#4B5563]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                    <p className="mt-1 text-base font-semibold text-[#181B31]">{item.value}</p>
                    <p className="text-xs text-[#6B7280]">{item.helper}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#3D64FF]" />
                  <div>
                    <p className="text-sm font-semibold text-[#181B31]">Plan benefits</p>
                    <p className="text-xs text-[#6B7280]">Scale plan · SSO ready · priority scoring</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 text-sm text-[#4B5563] sm:grid-cols-2">
                  {planFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-[#3D64FF]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-[-1rem] right-6 h-36 w-36 rounded-full bg-[#3D64FF]/12 blur-3xl" />
            </div>
            <div className="relative space-y-5">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-[#3D64FF]" />
                <h2 className="text-lg font-semibold text-[#181B31]">Usage at a glance</h2>
              </div>
              <p className="text-sm text-[#4B5563]">
                Personal metrics for this workspace seat. Keep an eye on throughput and sharing to keep hiring partners in sync.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {usageHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 shadow-card-soft"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/8 via-transparent to-transparent" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] text-[#3D64FF]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4B5563]">
                            Personal
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A94A6]">{item.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-[#181B31]">{item.value}</p>
                          <p className="text-sm text-[#4B5563]">{item.helper}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute bottom-[-4rem] left-10 h-40 w-40 rounded-full bg-[#3D64FF]/12 blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-[#3D64FF]" />
                <h2 className="text-lg font-semibold text-[#181B31]">Notifications</h2>
              </div>
              <div className="space-y-3">
                {notificationPreferences.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start justify-between gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-sm text-[#4B5563]"
                  >
                    <div>
                      <p className="font-semibold text-[#181B31]">{item.title}</p>
                      <p className="mt-1 text-xs text-[#8A94A6]">{item.description}</p>
                    </div>
                    <span
                      className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        item.enabled ? "bg-[#3D64FF]/15 text-[#3D64FF]" : "bg-[#DCE0E0] text-[#8A94A6]"
                      }`}
                    >
                      {item.enabled ? "Enabled" : "Muted"}
                    </span>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15">
                Adjust preferences
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
