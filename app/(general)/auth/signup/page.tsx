"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Users } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import Button from "@/app/components/buttons/Button";
import EmailInput from "@/app/components/inputs/EmailInput";
import PasswordInput from "@/app/components/inputs/PasswordInput";
import TextInput from "@/app/components/inputs/TextInput";
import SelectBox from "@/app/components/inputs/SelectBox";

type Highlight = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const highlights: Highlight[] = [
  {
    title: "Tailored onboarding",
    description: "We configure your ATS connections and scoring models for you.",
    icon: BadgeCheck,
  },
  {
    title: "Built for teams",
    description: "Invite recruiters, hiring managers, and approvers with roles.",
    icon: Users,
  },
  {
    title: "Performance insights",
    description: "Live funnel analytics and pass-through rates in one view.",
    icon: BarChart3,
  },
];

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.15 0 5.3 1.37 6.51 2.51l4.74-4.63C31.9 4.2 28.3 2.5 24 2.5 15.73 2.5 8.64 7.35 5.63 14.09l5.82 4.52C12.85 13 17.95 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.55-.14-2.68-.43-3.85H24v7.01h12.94c-.26 1.76-1.67 4.43-4.81 6.21l7.41 5.74c4.36-4.02 6.96-9.95 6.96-15.11Z"
      />
      <path
        fill="#FBBC05"
        d="M11.45 28.61c-.55-1.65-.86-3.41-.86-5.11 0-1.77.31-3.46.83-5.06l-5.82-4.52C3.71 16.32 2.5 20.02 2.5 23.5s1.23 7.15 3.11 9.58l5.84-4.47Z"
      />
      <path
        fill="#34A853"
        d="M24 44.5c4.86 0 8.93-1.59 11.91-4.33l-7.41-5.74c-2.02 1.17-4.75 1.86-7.32 1.86-5.64 0-10.44-3.8-12.18-9.18l-5.84 4.47C8.18 40.65 15.49 44.5 24 44.5Z"
      />
    </svg>
  );
}

function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button
      variant="white"
      fullWidth
      leftIcon={<GoogleIcon />}
      className="border-zinc-200 text-zinc-800 shadow-sm hover:border-zinc-300 hover:shadow"
    >
      {label}
    </Button>
  );
}

export default function SignUpPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#fef5ff] to-[#eef4ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_20%,rgba(216,8,128,0.08),transparent),radial-gradient(800px_420px_at_90%_12%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-[#1c0e2a] via-[#2d1744] to-[#0f1b35] p-10 text-white shadow-card-soft">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_25%_20%,rgba(216,8,128,0.22),transparent),radial-gradient(800px_420px_at_80%_12%,rgba(124,58,237,0.35),transparent)]" />
            <div className="relative space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Create account
              </span>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                Join carriX and launch faster hiring
              </h1>
              <p className="max-w-xl text-sm text-white/80">
                Set up a shared workspace for your team. Bring your ATS, define scoring
                rubrics, and let AI shortlist the right candidates automatically.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition hover:border-white/25 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="text-base font-semibold">{title}</div>
                    </div>
                    <p className="mt-2 text-sm text-white/70">{description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <span className="rounded-full bg-white/15 px-4 py-2 text-white/90 backdrop-blur">
                  Guided onboarding in 72 hours
                </span>
                <span className="rounded-full bg-white/15 px-4 py-2 text-white/90 backdrop-blur">
                  Role-based permissions
                </span>
                <span className="rounded-full bg-white/15 px-4 py-2 text-white/90 backdrop-blur">
                  SOC2-aligned practices
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-card-soft backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                    Get started
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900">Create your carriX account</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Spin up a workspace and invite teammates in minutes.
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  Free trial
                </span>
              </div>

              <div className="mt-6">
                <GoogleButton />
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  or continue with email
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
              </div>

              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label="Full name"
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                    isRequired
                  />
                  <EmailInput
                    label="Work email"
                    name="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    isRequired
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label="Company"
                    name="company"
                    placeholder="Acme Corp"
                    autoComplete="organization"
                    isRequired
                  />
                  <TextInput
                    label="Role"
                    name="role"
                    placeholder="Head of Talent"
                    autoComplete="organization-title"
                  />
                </div>

                <SelectBox
                  label="Team size"
                  name="teamSize"
                  placeholder="Select team size"
                  options={[
                    { value: "1-10", label: "1 - 10 people" },
                    { value: "11-50", label: "11 - 50 people" },
                    { value: "51-200", label: "51 - 200 people" },
                    { value: "200+", label: "200+ people" },
                  ]}
                />

                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  isRequired
                />

                <div className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    name="updates"
                    className="h-4 w-4 rounded border-zinc-300 text-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  <span>Send me product updates and hiring best practices.</span>
                </div>

                <Button type="submit" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Create account
                </Button>
              </form>

              <div className="mt-6 space-y-3 text-center text-sm text-zinc-600">
                <p>
                  By creating an account, you agree to our platform guidelines and data handling
                  practices.
                </p>
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary-600 transition hover:text-primary-500"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
