"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import ClientLayoutLoading from "@/app/components/loading/ClientLayoutLoading";
import { creditBundles as defaultCreditBundles, pricingPlans, type PricingPlan } from "@/app/data/pricing";
import { InvoiceModal } from "@/app/components/credits/InvoiceModal";
import { Pagination } from "@/app/components/Pagination";

type Bundle = {
  id: string;
  name: string;
  credits: number;
  price: number;
  perCredit: number;
  popular?: boolean;
};

type CreditBundlePayload = {
  id?: string;
  name: string;
  credits: number;
  isPopular?: boolean;
  sortOrder?: number;
};

type CreditBalance = {
  remaining: number;
  total: number;
  plan: string;
  planSlug?: string | null;
  planTier?: string | null;
  renewsOn?: string | null;
  subscriptionStatus?: string | null;
  topUpRate?: number | null;
};

type BillingEntry = {
  id: string;
  credits: number;
  type: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
  estimatedBdt: number | null;
};

type PaymentAction = "plan" | "topup" | "invoice";

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

export default function CreditsPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const paymentAction = searchParams.get("action");

  const { data: session, status: sessionStatus } = useSession();
  const role = (session as any)?.user?.role as string | undefined;
  const isCompanyAdmin = role === "COMPANY_ADMIN";

  const [selectedBundleCredits, setSelectedBundleCredits] = useState<number | null>(null);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("standard");
  const [processingAction, setProcessingAction] = useState<PaymentAction | null>(null);
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");

  const [plans, setPlans] = useState<PricingPlan[]>(pricingPlans);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [fallbackBundles, setFallbackBundles] = useState<CreditBundlePayload[]>(defaultCreditBundles);
  const [creditsToBuy, setCreditsToBuy] = useState<number | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingEntry[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<BillingEntry | null>(null);
  const [billingPage, setBillingPage] = useState(1);
  const billingPageSize = 10;

  useEffect(() => {
    if (paymentStatus === "success") {
      const label = paymentAction ? paymentAction.replace(/\b\w/g, (char) => char.toUpperCase()) : "Payment";
      setFlashMessage({ type: "success", text: `${label} completed successfully.` });
      return;
    }
    if (paymentStatus === "failed") {
      setFlashMessage({ type: "error", text: "Payment was not completed. Please try again." });
      return;
    }
    if (paymentStatus === "error") {
      setFlashMessage({ type: "error", text: "We could not verify the payment. Please try again." });
    }
  }, [paymentAction, paymentStatus]);

  const fetchBalance = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !isCompanyAdmin) {
      setBalanceLoading(false);
      return;
    }
    setBalanceLoading(true);
    setBalanceError("");
    try {
      const response = await fetch("/api/credits/balance");
      if (!response.ok) throw new Error("Failed to load credits");
      const payload = (await response.json()) as CreditBalance;
      setBalance(payload);
    } catch (error) {
      console.error(error);
      setBalanceError("Unable to load current balance");
    } finally {
      setBalanceLoading(false);
    }
  }, [isCompanyAdmin, sessionStatus]);

  const fetchPlans = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !isCompanyAdmin) {
      setPlansLoading(false);
      return;
    }
    setPlansLoading(true);
    setPlansError("");
    try {
      const response = await fetch("/api/public/pricing");
      if (!response.ok) throw new Error("Failed to load pricing");
      const payload = await response.json();
      const planList = Array.isArray(payload?.plans) && payload.plans.length ? payload.plans : pricingPlans;
      const bundleList = Array.isArray(payload?.creditBundles) ? payload.creditBundles : [];
      setPlans(planList);
      setFallbackBundles(bundleList.length ? bundleList : defaultCreditBundles);
    } catch (error) {
      console.error(error);
      setPlansError("Unable to load pricing plans");
      setPlans(pricingPlans);
      setFallbackBundles(defaultCreditBundles);
    } finally {
      setPlansLoading(false);
    }
  }, [isCompanyAdmin, sessionStatus]);

  useEffect(() => {
    fetchBalance();
    fetchPlans();
  }, [fetchBalance, fetchPlans]);

  useEffect(() => {
    if (balance?.planSlug) {
      setSelectedPlanSlug(balance.planSlug);
    }
  }, [balance?.planSlug]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !isCompanyAdmin) {
      setBillingLoading(false);
      return;
    }
    const loadBilling = async () => {
      setBillingLoading(true);
      setBillingError("");
      try {
        const res = await fetch("/api/credits/history");
        if (!res.ok) throw new Error("Failed to load billing history");
        const payload = await res.json();
        const entries = Array.isArray(payload?.entries) ? payload.entries : [];
        setBillingHistory(entries);
        setBillingPage(1);
      } catch (error) {
        console.error(error);
        setBillingError("Unable to load billing history");
        setBillingHistory([]);
      } finally {
        setBillingLoading(false);
      }
    };
    loadBilling();
  }, [isCompanyAdmin, sessionStatus]);

  const planList = plans.length ? plans : pricingPlans;
  const currentPlan =
    planList.find((plan) => plan.slug === balance?.planSlug) ??
    planList.find((plan) => plan.slug === selectedPlanSlug) ??
    planList[0];
  const selectedPlan = planList.find((plan) => plan.slug === selectedPlanSlug) ?? currentPlan;
  const isPlanChangeDisabled =
    !selectedPlan?.slug || selectedPlan?.slug === balance?.planSlug || processingAction === "plan";

  const normalizeBundles = useCallback((bundles: any[]): CreditBundlePayload[] => {
    if (!Array.isArray(bundles)) return [];
    return bundles
      .map((item) => (item && typeof item === "object" ? item : null))
      .filter(Boolean)
      .map((item: any) => ({
        id: typeof item.id === "string" ? item.id : undefined,
        name: typeof item.name === "string" ? item.name : "",
        credits: typeof item.credits === "number" ? item.credits : Number(item.credits) || 0,
        isPopular: Boolean(item.isPopular),
        sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : undefined,
      }))
      .filter((item) => item.name && item.credits > 0);
  }, []);

  const planBundles = useMemo(() => {
    const fromPlan = normalizeBundles((currentPlan as any)?.creditBundles ?? []);
    if (fromPlan.length) return fromPlan;
    const selectedPlanBundles = normalizeBundles((selectedPlan as any)?.creditBundles ?? []);
    if (selectedPlanBundles.length) return selectedPlanBundles;
    return normalizeBundles(fallbackBundles);
  }, [currentPlan, fallbackBundles, normalizeBundles, selectedPlan]);

  const topUpRate = balance?.topUpRate ?? currentPlan?.topUp ?? null;
  const bundleOptions: Bundle[] = useMemo(() => {
    if (!planBundles.length || topUpRate === null) return [];
    return planBundles.map((bundle) => {
      const price = Math.round((bundle.credits / 100) * topUpRate);
      const perCredit = topUpRate / 100;
      return {
        id: bundle.id ?? `bundle-${bundle.credits}`,
        name: bundle.name,
        credits: bundle.credits,
        price,
        perCredit,
        popular: bundle.isPopular,
      };
    });
  }, [planBundles, topUpRate]);

  useEffect(() => {
    if (!bundleOptions.length) return;
    setSelectedBundleCredits((current) => {
      const hasCurrent = current && bundleOptions.some((bundle) => bundle.credits === current);
      const nextCredits = hasCurrent
        ? current
        : (bundleOptions.find((bundle) => bundle.popular) ?? bundleOptions[0])?.credits ?? null;
      setCreditsToBuy((prev) => {
        if (prev && bundleOptions.some((bundle) => bundle.credits === prev)) return prev;
        return nextCredits;
      });
      return nextCredits;
    });
  }, [bundleOptions]);

  const selectedBundle =
    (selectedBundleCredits
      ? bundleOptions.find((bundle) => bundle.credits === selectedBundleCredits)
      : undefined) ?? bundleOptions[0];
  const effectiveCredits = creditsToBuy ?? selectedBundle?.credits ?? null;
  const calculatedPrice =
    topUpRate !== null && effectiveCredits !== null ? Math.round((effectiveCredits / 100) * topUpRate) : null;
  const balanceUsage = balance?.total ? Math.min(100, Math.round((balance.remaining / balance.total) * 100)) : 0;
  const renewalDate = balance?.renewsOn ? new Date(balance.renewsOn).toLocaleDateString() : null;
  const invoiceAmount = currentPlan?.price ?? 0;
  const subscriptionStatus = balance?.subscriptionStatus ?? "";
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const formatCurrency = (value: number | null | undefined) =>
    typeof value === "number" ? `BDT ${value.toLocaleString()}` : "—";
  const openInvoicePreview = (entry: BillingEntry) => setSelectedInvoice(entry);
  const closeInvoicePreview = () => setSelectedInvoice(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (selectedInvoice) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedInvoice]);
  const pagedBilling = useMemo(() => {
    const startIndex = (billingPage - 1) * billingPageSize;
    const endIndex = startIndex + billingPageSize;
    return billingHistory.slice(startIndex, endIndex);
  }, [billingHistory, billingPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(billingHistory.length / billingPageSize));
    if (billingPage > totalPages) {
      setBillingPage(totalPages);
    }
  }, [billingHistory.length, billingPage, billingPageSize]);

  const downloadInvoice = (entry: BillingEntry) => {
    const number = entry.referenceId || entry.id;
    const issued = formatDate(entry.createdAt);
    const amount = entry.estimatedBdt ?? Math.max(0, Math.round((entry.credits / 100) * (topUpRate ?? 0)));
    const itemLabel =
      entry.type === "PURCHASE"
        ? `${entry.credits} credits top-up`
        : entry.type === "ALLOTMENT"
          ? `${entry.credits} credits (plan allotment)`
          : `${entry.credits} credits (${entry.type.toLowerCase()})`;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
    h1 { margin: 0 0 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>Invoice ${number}</h1>
  <p><strong>Issued:</strong> ${issued}</p>
  <p><strong>Description:</strong> ${entry.description ?? itemLabel}</p>
  <table>
    <thead><tr><th>Item</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>${itemLabel}</td><td>${formatCurrency(amount)}</td></tr>
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${number}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startPayment = async (payload: { action: PaymentAction; planSlug?: string; credits?: number }) => {
    setProcessingAction(payload.action);
    setFlashMessage(null);

    try {
      const response = await fetch("/api/sslcommerz/billing/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to start payment");
      }

      if (data?.gatewayUrl) {
        window.location.href = data.gatewayUrl;
        return;
      }

      if (data?.completed) {
        await Promise.all([fetchBalance(), fetchPlans()]);
        setFlashMessage({ type: "success", text: "Plan updated successfully." });
        return;
      }

      setFlashMessage({ type: "success", text: "Payment initialized." });
    } catch (error) {
      console.error(error);
      setFlashMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to start payment right now.",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const isPageLoading =
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && isCompanyAdmin && (balanceLoading || plansLoading));

  if (isPageLoading) {
    return <ClientLayoutLoading />;
  }

  if (sessionStatus === "authenticated" && !isCompanyAdmin) {
    return (
      <div className="space-y-6 text-[#181B31]">
        <section className="rounded-4xl border border-[#DCE0E0]/80 bg-white p-6 shadow-card-soft">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4f8] text-[#D80880]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-[#181B31]">Admin access required</h1>
              <p className="text-sm text-[#4B5563]">
                Only company admins can view and manage billing & credits. Ask an admin to top up or grant you access.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/10"
                >
                  Back to dashboard
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#D80880]/20 bg-[#fff4f8] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#D80880] transition hover:border-[#D80880]/40"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                Billing & credits
              </span>
              <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
                Manage plan, invoices, and credits
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563] md:text-base">
                Upgrade your plan, pay monthly invoices, and top up credits through SSLCommerz. Everything updates in
                real time once payment clears.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3D64FF]" />
                  SSLCommerz secure
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <CreditCard className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Invoice receipts
                </span>
              </div>
              {flashMessage ? (
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    flashMessage.type === "success"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {flashMessage.text}
                </div>
              ) : null}
              {balanceError || plansError ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-[#D80880]">
                  {balanceError || plansError}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-96">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Remaining balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-[#181B31]">
                  {balance?.remaining ?? "—"}
                </p>
                <p className="text-sm font-semibold text-[#8A94A6]">/ {balance?.total ?? "—"} credits</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E9F0]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292]"
                  style={{ width: `${balanceUsage}%` }}
                />
              </div>
              <p className="text-xs text-[#8A94A6]">
                {renewalDate
                  ? `Renews on ${renewalDate} · ${currentPlan?.name ?? "Plan"}`
                  : "Plan details unavailable"}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startPayment({ action: "invoice" })}
                  disabled={processingAction === "invoice" || invoiceAmount <= 0}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    invoiceAmount > 0 && processingAction !== "invoice"
                      ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                      : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
                  }`}
                >
                  {processingAction === "invoice" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {invoiceAmount > 0 ? `Pay BDT ${invoiceAmount.toLocaleString()}` : "No invoice"}
                </button>
                <button
                  type="button"
                  onClick={() => (effectiveCredits ? startPayment({ action: "topup", credits: effectiveCredits }) : null)}
                  disabled={processingAction === "topup" || !selectedBundle || effectiveCredits === null}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    processingAction !== "topup" && selectedBundle && effectiveCredits !== null
                      ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                      : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
                  }`}
                >
                  {processingAction === "topup" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet2 className="h-4 w-4" />
                  )}
                  Buy credits
                </button>
              </div>
              <div className="rounded-2xl border border-[#E7E9F0] bg-[#F8F9FE] px-4 py-3 text-xs text-[#4B5563]">
                <p className="font-semibold text-[#181B31]">Subscription status</p>
                <p className="mt-1">{subscriptionStatus || "Active"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-[#DCE0E0] bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Usage</p>
                  <p className="text-sm font-semibold text-[#181B31]">Credits remaining</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f5ff] text-[#3D64FF]">
                  <Wallet2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold text-[#181B31]">{balance?.remaining ?? "—"}</p>
              <p className="text-xs text-[#8A94A6]">Shared across your workspace.</p>
            </div>
            <div className="rounded-3xl border border-[#DCE0E0] bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Renewal</p>
                  <p className="text-sm font-semibold text-[#181B31]">Next cycle</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4f8] text-[#D80880]">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xl font-semibold text-[#181B31]">{renewalDate || "Set renewal date"}</p>
              <p className="text-xs text-[#8A94A6]">Pay before the due date to keep access active.</p>
            </div>
            <div className="rounded-3xl border border-[#DCE0E0] bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Plan</p>
                  <p className="text-sm font-semibold text-[#181B31]">Current subscription</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f9f3] text-[#16a34a]">
                  <RefreshCw className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xl font-semibold text-[#16a34a]">{currentPlan?.name ?? "—"}</p>
              <p className="text-xs text-[#8A94A6]">Switch plans anytime. Upgrades apply instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Upgrade plan</p>
            <h2 className="text-lg font-semibold text-[#181B31]">Choose a plan that fits your team</h2>
            <p className="text-sm text-[#4B5563]">
              Select a new plan and pay via SSLCommerz. Seat limits and monthly credits refresh immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startPayment({ action: "plan", planSlug: selectedPlan?.slug })}
            disabled={isPlanChangeDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              !isPlanChangeDisabled
                ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
            }`}
          >
            {processingAction === "plan" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {selectedPlan?.slug === balance?.planSlug
              ? "Current plan"
              : selectedPlan?.price
                ? `Upgrade to ${selectedPlan.name}`
                : "Switch plan"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {planList.map((plan) => {
            const isSelected = plan.slug === selectedPlanSlug;
            const isCurrent = plan.slug === balance?.planSlug;
            return (
              <button
                key={plan.slug}
                type="button"
                onClick={() => setSelectedPlanSlug(plan.slug)}
                className={`relative flex flex-col gap-2 rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#3D64FF]/60 bg-[#3D64FF]/10 shadow-sm"
                    : "border-[#DCE0E0] bg-white hover:border-[#3D64FF]/40"
                }`}
              >
                {isCurrent ? (
                  <span className="absolute right-4 top-4 rounded-full bg-[#3D64FF]/10 px-2 py-1 text-[11px] font-semibold uppercase text-[#3D64FF]">
                    Current
                  </span>
                ) : null}
                <p className="text-base font-semibold text-[#181B31]">{plan.name}</p>
                <p className="text-2xl font-extrabold text-[#181B31]">
                  {plan.price === 0 ? "BDT 0" : `BDT ${plan.price.toLocaleString()}`}
                  <span className="text-xs font-semibold text-[#6b7280]"> / {plan.period}</span>
                </p>
                <p className="text-sm text-[#475569]">{plan.description}</p>
                <div className="mt-auto rounded-xl bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#0f172a]">
                  {plan.team ? `${plan.team} seats included` : "Seat limit based on plan"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Custom top-up</p>
            <h2 className="text-lg font-semibold text-[#181B31]">Choose how many credits to buy</h2>
            <p className="text-sm text-[#4B5563]">
              Pricing is based on your current plan’s top-up rate (BDT {topUpRate ?? "—"} per 100 credits).
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
              Credits
              <input
                type="number"
                min={50}
                step={50}
                value={effectiveCredits ?? ""}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  setCreditsToBuy(Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null);
                }}
                className="mt-2 w-32 rounded-xl border border-[#DCE0E0] px-3 py-2 text-sm text-[#181B31] outline-none focus:border-[#3D64FF]"
              />
            </label>
            <div className="text-sm font-semibold text-[#181B31]">
              {calculatedPrice !== null ? `BDT ${calculatedPrice.toLocaleString()}` : "Select credits"}
              {effectiveCredits !== null ? (
                <span className="ml-2 text-xs font-semibold text-[#8A94A6]">
                  ({effectiveCredits} credits @ BDT {(topUpRate ?? 0) / 100} per credit)
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => (effectiveCredits ? startPayment({ action: "topup", credits: effectiveCredits }) : null)}
              disabled={processingAction === "topup" || effectiveCredits === null || topUpRate === null}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                processingAction !== "topup" && effectiveCredits !== null && topUpRate !== null
                  ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                  : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
              }`}
            >
              {processingAction === "topup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Pay with SSLCommerz
            </button>
          </div>
        </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Billing history</p>
            <p className="text-sm text-[#4B5563]">Recent invoices and credit top-ups.</p>
          </div>
          {billingLoading ? (
            <span className="text-xs font-semibold text-[#8A94A6]">Loading…</span>
          ) : billingError ? (
            <span className="text-xs font-semibold text-[#D80880]">{billingError}</span>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E7E9F0] text-sm text-[#181B31]">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Amount (BDT)</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E9F0]">
              {!billingLoading && billingHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-xs font-semibold text-[#8A94A6]">
                    No billing records yet.
                  </td>
                </tr>
              ) : (
                pagedBilling.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#F8F9FE]">
                    <td className="px-3 py-3">{formatDate(entry.createdAt)}</td>
                    <td className="px-3 py-3 font-semibold">
                      {entry.type === "PURCHASE"
                        ? "Top-up"
                        : entry.type === "ALLOTMENT"
                          ? "Plan credit"
                          : entry.type === "USAGE"
                            ? "Usage"
                            : entry.type === "REFUND"
                              ? "Refund"
                              : "Adjustment"}
                    </td>
                    <td className="px-3 py-3">{entry.credits.toLocaleString()} credits</td>
                    <td className="px-3 py-3">
                      {entry.estimatedBdt !== null ? `BDT ${entry.estimatedBdt.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#4B5563]">
                      {entry.referenceId || entry.description || "—"}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <button
                        type="button"
                        onClick={() => openInvoicePreview(entry)}
                        className="rounded-full border border-[#DCE0E0] px-3 py-1 font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/10"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {billingHistory.length > billingPageSize ? (
          <div className="mt-4">
            <Pagination
              page={billingPage}
              totalItems={billingHistory.length}
              pageSize={billingPageSize}
              onPageChange={setBillingPage}
            />
          </div>
        ) : null}
      </section>

      {selectedInvoice ? (
        <InvoiceModal
          entry={selectedInvoice}
          topUpRate={topUpRate}
          onClose={closeInvoicePreview}
          onDownload={downloadInvoice}
        />
      ) : null}

      <section className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Checkout</p>
            <p className="text-sm text-[#4B5563]">
              {effectiveCredits !== null
                ? `Top-up: ${effectiveCredits} credits @ BDT ${(topUpRate ?? 0) / 100} per credit`
                : "Select credits to continue"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {flashMessage && flashMessage.type === "error" ? (
              <span className="text-xs font-semibold text-[#D80880]">{flashMessage.text}</span>
            ) : null}
            <button
              type="button"
              onClick={() => (effectiveCredits ? startPayment({ action: "topup", credits: effectiveCredits }) : null)}
              disabled={processingAction === "topup" || effectiveCredits === null || topUpRate === null}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                effectiveCredits !== null && topUpRate !== null && processingAction !== "topup"
                  ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                  : "border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
              }`}
            >
              {processingAction === "topup" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 text-[#3D64FF]" />
              )}
              Pay with SSLCommerz
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
