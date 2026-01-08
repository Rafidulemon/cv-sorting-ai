"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";

export default function ResetPasswordPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#fef5ff] to-[#eef4ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_20%,rgba(216,8,128,0.08),transparent),radial-gradient(700px_400px_at_90%_10%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-[#1c0e2a] via-[#2d1744] to-[#0f1b35] p-10 text-white shadow-card-soft">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_25%_20%,rgba(216,8,128,0.22),transparent),radial-gradient(800px_420px_at_80%_10%,rgba(124,58,237,0.35),transparent)]" />
            <div className="relative space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Reset password
              </span>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                Choose a strong password to secure your workspace.
              </h1>
              <p className="max-w-xl text-sm text-white/80">
                Use at least 8 characters with a mix of letters, numbers, and symbols. Avoid passwords you reuse on other sites.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Encrypted reset",
                    desc: "Your link is single-use and time-limited.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Stay secure",
                    desc: "Enable 2FA in settings after you log back in.",
                    icon: Sparkles,
                  },
                ].map(({ title, desc, icon: Icon }) => (
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
                    <p className="mt-2 text-sm text-white/70">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-card-soft backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                    Reset password
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900">Set a new password</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Enter and confirm your new password to access your workspace.
                  </p>
                </div>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>

              <form
                className="mt-8 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <TextInput
                  label="New password"
                  name="password"
                  placeholder="Create a strong password"
                  type="password"
                  autoComplete="new-password"
                  isRequired
                />
                <TextInput
                  label="Confirm password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  type="password"
                  autoComplete="new-password"
                  isRequired
                />

                <div className="flex items-start gap-3 rounded-2xl bg-primary-50/70 p-3 text-xs text-primary-800">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold">Password tips</div>
                    <p>Create a unique passphrase with numbers and symbols. Avoid names or reused credentials.</p>
                  </div>
                </div>

                <Button type="submit" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Save new password
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-600">
                Didn’t request this?{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-primary-600 transition hover:text-primary-500"
                >
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
