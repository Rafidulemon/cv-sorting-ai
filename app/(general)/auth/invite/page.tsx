"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, ShieldCheck, Users } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";
import PasswordInput from "@/app/components/inputs/PasswordInput";

type InvitationInfo = {
  email: string;
  role: string;
  organizationName: string;
  inviterName?: string | null;
  seatsRemaining: number | null;
  expiresAt: string;
};

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("Missing invitation token. Please use the link from your email.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/auth/invitations?token=${token}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load invitation.");
        }

        const inviteData: InvitationInfo = {
          email: payload?.invitation?.email ?? "",
          role: payload?.invitation?.role ?? "COMPANY_MEMBER",
          organizationName: payload?.invitation?.organizationName ?? "Workspace",
          inviterName: payload?.invitation?.inviterName,
          seatsRemaining: payload?.invitation?.seatsRemaining ?? null,
          expiresAt: payload?.invitation?.expiresAt ?? "",
        };

        setInvitation(inviteData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load invitation.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError("Missing invitation token. Please use the link from your email.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, name, password }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to accept invitation right now.");
        }

        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to accept invitation right now.");
      }
    });
  };

  const roleLabel = (invitation?.role ?? "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#f7fbff] to-[#f9f5ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_360px_at_15%_12%,rgba(59,130,246,0.12),transparent),radial-gradient(760px_360px_at_85%_16%,rgba(124,58,237,0.12),transparent)]" />
      <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-16">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Workspace invitation</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0f172a]">Join {invitation?.organizationName ?? "workspace"}</h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Complete your account to access shared hiring tools, with seats enforced by the selected plan.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-card-soft">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            <span className="text-sm font-semibold text-[#0f172a]">Loading invitation…</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-semibold">We hit a snag</p>
              <p>{error}</p>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-6 shadow-card-soft">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-white p-2 text-green-600 shadow">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="space-y-2 text-sm text-green-900">
                <p className="text-lg font-semibold">You&apos;re in</p>
                <p>
                  Your account is active for {invitation?.organizationName}. Use your credentials to log in and start collaborating.
                </p>
                <Button href="/auth/login" variant="secondary">
                  Go to login
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card-soft backdrop-blur"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{invitation?.organizationName}</p>
                <p className="text-xs text-[#475569]">
                  Invited by {invitation?.inviterName || "workspace owner"} · Role: {roleLabel}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f0ff] px-3 py-1 text-xs font-semibold text-[#0f172a]">
                <Users className="h-3.5 w-3.5 text-primary-600" />
                {invitation?.seatsRemaining !== null && invitation?.seatsRemaining !== undefined
                  ? `${invitation.seatsRemaining} seats remaining`
                  : "Seats synced"}
              </div>
            </div>

            <TextInput
              label="Full name"
              name="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              isRequired
            />

            <TextInput label="Email" value={invitation?.email ?? ""} disabled helperText="From your invitation" />

            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordInput
                label="Create password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                isRequired
              />
              <PasswordInput
                label="Confirm password"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                isRequired
              />
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              fullWidth
              rightIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              disabled={isPending}
            >
              {isPending ? "Creating access…" : "Accept invitation"}
            </Button>

            <div className="flex items-center gap-2 rounded-xl bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#0f172a]">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              Invitation link expires {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : "soon"}.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
