"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import EmailInput from "@/app/components/inputs/EmailInput";

export default function ForgetPasswordPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#fdf4ff] to-[#eef4ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_20%,rgba(216,8,128,0.08),transparent),radial-gradient(700px_400px_at_90%_10%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-[#1f0f2a] via-[#2d1544] to-[#0f1a35] p-10 text-white shadow-card-soft">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_25%_20%,rgba(216,8,128,0.22),transparent),radial-gradient(800px_420px_at_80%_10%,rgba(124,58,237,0.35),transparent)]" />
            <div className="relative space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Reset access
              </span>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                No worries—we’ll get you back in.
              </h1>
              <p className="max-w-xl text-sm text-white/80">
                Enter the work email you use for carriX and we’ll send a secure reset link. If you need help, our support team is a message away.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Secure links only",
                    desc: "Tokens expire quickly to keep accounts safe.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Fast response",
                    desc: "Most reset emails arrive within 30 seconds.",
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
                    Forgot password
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900">Send a reset link</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    We’ll email you a secure link to choose a new password.
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
                <EmailInput
                  label="Work email"
                  name="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  isRequired
                />

                <Button type="submit" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Send reset link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-600">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary-600 transition hover:text-primary-500"
                >
                  Go to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
