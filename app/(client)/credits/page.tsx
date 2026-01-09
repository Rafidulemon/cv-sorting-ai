"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

type Bundle = {
  id: string;
  name: string;
  credits: number;
  price: string;
  perCredit: string;
  popular?: boolean;
};

type CreditBalance = {
  remaining: number;
  total: number;
  plan: string;
  renewsOn: string;
};

const bundles: Bundle[] = [
  { id: "starter", name: "Starter boost", credits: 250, price: "$49", perCredit: "$0.20" },
  { id: "growth", name: "Growth", credits: 750, price: "$119", perCredit: "$0.16" },
  { id: "scale", name: "Scale", credits: 2000, price: "$269", perCredit: "$0.13", popular: true },
];

export default function CreditsPage() {
  const [selectedBundleId, setSelectedBundleId] = useState<string>(bundles[1]?.id ?? bundles[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");

  const selectedBundle = bundles.find((bundle) => bundle.id === selectedBundleId);
  const balanceUsage = balance?.total ? Math.min(100, Math.round((balance.remaining / balance.total) * 100)) : 0;
  const renewalDate = balance?.renewsOn ? new Date(balance.renewsOn).toLocaleDateString() : null;

  const startCheckout = async () => {
    if (!selectedBundle) return;
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId: selectedBundle.id }),
      });

      if (!response.ok) {
        throw new Error("Unable to start checkout");
      }

      const payload = await response.json();
      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Unable to start checkout. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      setBalanceLoading(true);
      setBalanceError("");
      try {
        const response = await fetch("/api/credits/balance");
        if (!response.ok) throw new Error("Failed to load credits");
        const payload = (await response.json()) as CreditBalance;
        if (isMounted) setBalance(payload);
      } catch (error) {
        console.error(error);
        if (isMounted) setBalanceError("Unable to load current balance");
      } finally {
        if (isMounted) setBalanceLoading(false);
      }
    };

    loadBalance();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
              <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              Credits
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
              Top up credits to keep sorting
            </h1>
            <p className="max-w-2xl text-sm text-[#4B5563] md:text-base">
              Choose a one-time boost or extend your allowance so CV analysis and sorting runs never pause mid-hire.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3D64FF]" />
                Secure checkout
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <CreditCard className="h-3.5 w-3.5 text-[#3D64FF]" />
                Invoices ready
              </span>
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-80">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Current balance</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-[#181B31]">
                {balanceLoading ? "…" : balance?.remaining ?? "—"}
              </p>
              <p className="text-sm font-semibold text-[#8A94A6]">
                / {balanceLoading ? "…" : balance?.total ?? "—"} credits
              </p>
            </div>
            <div
              className={`h-2 w-full overflow-hidden rounded-full bg-[#E7E9F0] ${
                balanceLoading ? "animate-pulse" : ""
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292]"
                style={{ width: `${balanceUsage}%` }}
              />
            </div>
            <p className="text-xs text-[#8A94A6]">
              {balanceLoading
                ? "Loading plan…"
                : balanceError ||
                  (renewalDate ? `Renewal on ${renewalDate} · ${balance?.plan ?? "Plan"}` : "Plan details unavailable")}
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15"
            >
              Manage plan
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.name}
            className={`relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft ${
              bundle.popular ? "border-[#3D64FF]/50 shadow-[0_18px_40px_-24px_rgba(61,100,255,0.4)]" : ""
            }`}
          >
            {bundle.popular ? (
              <span className="absolute right-4 top-4 rounded-full bg-[#3D64FF]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3D64FF]">
                Most popular
              </span>
            ) : null}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#181B31]">{bundle.name}</p>
              <p className="text-3xl font-semibold text-[#181B31]">{bundle.price}</p>
              <p className="text-sm text-[#4B5563]">
                {bundle.credits} credits · {bundle.perCredit} / credit
              </p>
              <button
                type="button"
                onClick={() => setSelectedBundleId(bundle.id)}
                className={`mt-2 inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedBundleId === bundle.id
                    ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary"
                    : "border-[#DCE0E0] bg-[#FFFFFF] text-[#3D64FF] hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/10"
                }`}
              >
                {selectedBundleId === bundle.id ? "Selected" : "Select bundle"}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#181B31]">How credits work</h2>
          <p className="text-sm text-[#4B5563]">
            Credits fuel every CV analysis and bulk sorting run. Top-ups apply instantly and roll over to your next
            billing cycle.
          </p>
          <ul className="space-y-2 text-sm text-[#4B5563]">
            <li>- Single CV report: 1 credit</li>
            <li>- Bulk sort: 1 credit per CV processed</li>
            <li>- Exports and retries are free on active jobs</li>
          </ul>
        </div>
        <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#F7F8FC] p-5 text-sm text-[#4B5563]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Need a custom pack?</p>
          <p>
            Talk to our team for annual prepayment, procurement compliance, or volume-based discounts across multiple
            workspaces.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15"
          >
            Contact sales
          </Link>
        </div>
      </section>

      <section className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Checkout</p>
            <p className="text-sm text-[#4B5563]">
              {selectedBundle ? `Bundle: ${selectedBundle.name} — ${selectedBundle.credits} credits` : "Select a bundle"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === "error" ? (
              <span className="text-xs font-semibold text-[#D80880]">{errorMessage}</span>
            ) : null}
            {status === "success" ? (
              <span className="text-xs font-semibold text-success-600">Checkout started</span>
            ) : null}
            <button
              type="button"
              onClick={startCheckout}
              disabled={!selectedBundle || isSubmitting}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                selectedBundle && !isSubmitting
                  ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                  : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-[#3D64FF]" />
                  Proceed to checkout
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
