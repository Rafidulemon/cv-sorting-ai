import { Bell, CreditCard, ShieldCheck, Sparkles, UploadCloud, Users2 } from 'lucide-react';

const usageHighlights = [
  { label: 'Active seats', value: '6', helper: '+2 this month', icon: Users2 },
  { label: 'Monthly CV allowance', value: '312 / 500', helper: 'Renewal on 28 Nov', icon: UploadCloud },
  { label: 'Plan status', value: 'Scale', helper: 'Includes advanced scoring', icon: ShieldCheck },
];

const notificationPreferences = [
  {
    title: 'Weekly talent digest',
    description: 'Curated report of shortlisted candidates and pipeline health.',
    enabled: true,
  },
  {
    title: 'Processing alerts',
    description: 'Instant notifications when a job finishes sorting or encounters an issue.',
    enabled: true,
  },
  {
    title: 'Insights & experiments',
    description: 'Early access announcements and optimisation suggestions from the AI.',
    enabled: false,
  },
];

const planFeatures = [
  'Unlimited job descriptions with AI assisted drafting.',
  'Advanced semantic scoring and bias mitigation controls.',
  'Priority support with a dedicated talent advisor.',
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
                Keep your hiring workspace aligned
              </h1>
              <p className="max-w-xl text-sm text-[#4B5563] lg:text-base">
                Manage billing, seats, and notifications for the whole talent team. Everything stays in sync with your
                AI-powered workflows.
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

        <section className="grid gap-6 lg:grid-cols-3">
          {usageHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/12 via-transparent to-transparent" />
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
                        item.enabled
                          ? 'bg-[#3D64FF]/15 text-[#3D64FF]'
                          : 'bg-[#DCE0E0] text-[#8A94A6]'
                      }`}
                    >
                      {item.enabled ? 'Enabled' : 'Muted'}
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
