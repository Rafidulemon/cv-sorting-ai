"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import PasswordInput from "@/app/components/inputs/PasswordInput";

type ResetStatus = "checking" | "ready" | "invalid" | "completed";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ResetStatus>("checking");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setError("Reset link is missing or invalid.");
      setStatus("invalid");
      return;
    }

    const validateToken = async () => {
      setStatus("checking");
      setError("");
      setSuccess("");
      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const raw = await response.text();
        const data = raw ? JSON.parse(raw) : {};

        if (!response.ok) {
          const message = data?.error ?? response.statusText ?? "This reset link is invalid or has expired.";
          throw new Error(message);
        }

        if (cancelled) return;

        setEmailHint(typeof data?.email === "string" ? data.email : "");
        setName(typeof data?.name === "string" ? data.name : "");
        setStatus("ready");
      } catch (tokenError) {
        if (cancelled) return;
        setError((tokenError as Error)?.message ?? "This reset link is invalid or has expired.");
        setStatus("invalid");
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "ready") return;

    setError("");
    setSuccess("");

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        const message = data?.error ?? response.statusText ?? "Unable to reset password right now.";
        throw new Error(message);
      }

      setStatus("completed");
      setSuccess("Password updated. You can now log in with your new credentials.");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError((submitError as Error)?.message ?? "Unable to reset password right now.");
    } finally {
      setIsPending(false);
    }
  };

  const isDisabled = status !== "ready" || isPending;

  useEffect(() => {
    if (status !== "completed") return;
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [status, router]);

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
                onSubmit={handleSubmit}
              >
                {status === "checking" ? (
                  <div className="rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm font-semibold text-primary-800">
                    Validating reset link…
                  </div>
                ) : null}
                {error ? (
                  <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {success}
                  </div>
                ) : null}
                {status === "ready" && (emailHint || name) ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                    Resetting access for {name || "your account"}
                    {emailHint ? ` (${emailHint})` : ""}.
                  </div>
                ) : null}

                <PasswordInput
                  label="New password"
                  name="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  isRequired
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isDisabled}
                />
                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  isRequired
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isDisabled}
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

                <Button type="submit" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} disabled={isDisabled}>
                  {status === "completed" ? "Password updated" : isPending ? "Saving..." : "Save new password"}
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
