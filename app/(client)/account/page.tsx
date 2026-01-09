import {
  Bell,
  Building2,
  CreditCard,
  Globe2,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  Users2,
} from "lucide-react";

const usageHighlights = [
  { label: "Active seats", value: "6", helper: "+2 this month", icon: Users2 },
  { label: "Monthly CV allowance", value: "312 / 500", helper: "Renews on 28 Nov", icon: UploadCloud },
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

export default function AccountPage() {
  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-10 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 right-12 h-60 w-60 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
              <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              Account centre
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
              See and edit your profile & workspace
            </h1>
            <p className="max-w-xl text-sm text-[#4B5563] lg:text-base">
              Keep your details fresh, control workspace defaults, and sync billing without leaving the dashboard.
            </p>
          </div>
          <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-[#181B31] shadow-card-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Current balance</p>
            <p className="mt-3 text-3xl font-semibold text-[#181B31]">£1,284.00</p>
            <p className="mt-1 text-xs text-[#8A94A6]">Next invoice scheduled · 28 November 2025</p>
            <button className="mt-6 inline-flex items-center justify-center rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage billing
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          </div>
          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#181B31]">Profile</p>
                <p className="text-xs text-[#6B7280]">Update your name, role, and contact details.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Full name
                <input
                  defaultValue="Md. Rafidul Islam"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Job title
                <input
                  defaultValue="Head of Talent Ops"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Work email
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#181B31] focus-within:border-[#3D64FF] focus-within:ring-2 focus-within:ring-[#3D64FF]/10">
                  <Mail className="h-4 w-4 text-[#9AA0B5]" />
                  <input
                    defaultValue="rafidul@carrix.com"
                    className="w-full bg-transparent text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:outline-none"
                  />
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Phone
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#181B31] focus-within:border-[#3D64FF] focus-within:ring-2 focus-within:ring-[#3D64FF]/10">
                  <Phone className="h-4 w-4 text-[#9AA0B5]" />
                  <input
                    defaultValue="+880 1700 123 456"
                    className="w-full bg-transparent text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:outline-none"
                  />
                </div>
              </label>
            </div>

            <label className="space-y-2 text-sm font-semibold text-[#181B31]">
              Bio
              <textarea
                rows={3}
                defaultValue="Guiding teams to shortlist faster with carriX. Loves clean pipelines, strong signals, and good coffee."
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3D64FF]/50 hover:text-[#3D64FF]"
              >
                Reset
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D64FF] to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(61,100,255,0.6)] transition hover:translate-y-[-2px]"
              >
                Save profile
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-[#ffe6f2] blur-3xl" />
          </div>
          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff4f8] text-[#d80880]">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#181B31]">Workspace & account</p>
                <p className="text-xs text-[#6B7280]">Manage company info, region, and access defaults.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Company
                <input
                  defaultValue="carriX Labs"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Workspace URL
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#181B31] focus-within:border-[#3D64FF] focus-within:ring-2 focus-within:ring-[#3D64FF]/10">
                  <Link2 className="h-4 w-4 text-[#9AA0B5]" />
                  <span className="text-xs font-semibold text-[#6B7280]">carrix.com/</span>
                  <input
                    defaultValue="rafidul-team"
                    className="w-full bg-transparent text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:outline-none"
                  />
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Time zone
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#181B31] focus-within:border-[#3D64FF] focus-within:ring-2 focus-within:ring-[#3D64FF]/10">
                  <Globe2 className="h-4 w-4 text-[#9AA0B5]" />
                  <select className="w-full bg-transparent text-sm font-semibold text-[#181B31] focus:outline-none">
                    <option>GMT+6 · Dhaka</option>
                    <option>GMT · London</option>
                    <option>GMT-5 · New York</option>
                    <option>GMT+10 · Sydney</option>
                  </select>
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Billing email
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#181B31] focus-within:border-[#3D64FF] focus-within:ring-2 focus-within:ring-[#3D64FF]/10">
                  <Mail className="h-4 w-4 text-[#9AA0B5]" />
                  <input
                    defaultValue="finance@carrix.com"
                    className="w-full bg-transparent text-sm font-semibold text-[#181B31] placeholder:text-[#9AA0B5] focus:outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Preferred language
                <select className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10">
                  <option>English (UK)</option>
                  <option>English (US)</option>
                  <option>Bangla</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#181B31]">
                Seats reserved
                <input
                  type="number"
                  min={1}
                  defaultValue={8}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#181B31] focus:border-[#3D64FF] focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/10"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d80880]/40 hover:text-[#d80880]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#d80880] to-[#3D64FF] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(216,8,128,0.6)] transition hover:translate-y-[-2px]"
              >
                Save account
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {usageHighlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/10 via-transparent to-transparent" />
              <div className="relative space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] text-[#3D64FF]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A94A6]">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#181B31]">{item.value}</p>
                  <p className="mt-1 text-sm text-[#4B5563]">{item.helper}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 right-0 h-36 w-36 rounded-full bg-[#3D64FF]/20 blur-3xl" />
          </div>
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#3D64FF]" />
              <h2 className="text-lg font-semibold text-[#181B31]">Plan benefits</h2>
            </div>
            <p className="text-sm text-[#4B5563]">
              You&apos;re on the Scale plan. Unlock additional automation, role duplication, and SSO support by
              upgrading to Enterprise.
            </p>
            <ul className="space-y-3 text-sm text-[#4B5563]">
              {planFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#3D64FF]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15">
              Explore Enterprise
            </button>
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
            <div className="space-y-4">
              {notificationPreferences.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-6 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-sm text-[#4B5563]"
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
      </section>
    </div>
  );
}
