"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle, ArrowRight, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import EmailInput from "@/app/components/inputs/EmailInput";
import SelectBox from "@/app/components/inputs/SelectBox";
import { pricingPlans, type PricingPlan } from "@/app/data/pricing";

type SignupInfo = {
  name: string;
  email: string;
  companyName: string;
  planSlug: string;
  billingEmail: string;
  expiresAt: string;
  status?: string;
  organizationId?: string;
};

const planSeatDefaults: Record<string, number> = {
  free: 1,
  standard: 5,
  premium: 10,
};

export default function ConfirmSignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, data: session } = useSession();
  const token = searchParams.get("token");
  const paymentStatus = searchParams.get("payment");
  const [signup, setSignup] = useState<SignupInfo | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>(pricingPlans);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [billingEmail, setBillingEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ invoiceNumber: string; organizationSlug: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.replace(role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (paymentStatus === "failed") {
      setError("Payment was not completed. Please try again.");
    } else if (paymentStatus === "error") {
      setError("We could not verify the payment. Please try again or contact support.");
    }
  }, [paymentStatus]);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("Missing signup token. Please use the link from your email.");
        setLoading(false);
        return;
      }
      try {
        const [signupResponse, pricingResponse] = await Promise.all([
          fetch(`/api/auth/signup?token=${token}`),
          fetch("/api/public/pricing"),
        ]);

        const signupPayload = await signupResponse.json();
        const pricingPayload = await pricingResponse.json().catch(() => ({}));

        if (!signupResponse.ok) {
          throw new Error(signupPayload?.error ?? "Unable to load signup details.");
        }

        const signupData: SignupInfo = {
          name: signupPayload.signup?.name ?? "",
          email: signupPayload.signup?.email ?? "",
          companyName: signupPayload.signup?.companyName ?? "Your company",
          planSlug: signupPayload.signup?.planSlug ?? "standard",
          billingEmail: signupPayload.signup?.billingEmail ?? signupPayload.signup?.email ?? "",
          expiresAt: signupPayload.signup?.expiresAt ?? "",
          status: signupPayload.signup?.status ?? "",
          organizationId: signupPayload.signup?.organizationId ?? "",
        };

        setSignup(signupData);
        setSelectedPlan(signupData.planSlug);
        setBillingEmail(signupData.billingEmail);
        setPlans(Array.isArray(pricingPayload?.plans) && pricingPayload.plans.length ? pricingPayload.plans : pricingPlans);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load signup details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const selectedPlanDetails = useMemo(() => {
    return plans.find((plan) => plan.slug === selectedPlan) ?? pricingPlans.find((plan) => plan.slug === selectedPlan);
  }, [plans, selectedPlan]);

  const seatLimit = selectedPlanDetails?.team ?? planSeatDefaults[selectedPlan] ?? 1;
  const planPrice = selectedPlanDetails?.price ?? 0;
  const requiresPayment = planPrice > 0 && selectedPlan !== "free";

  const handleFinalize = () => {
    if (!token) {
      setError("Missing signup token. Please use the link from your email.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            planSlug: selectedPlan,
            billingEmail,
            paymentConfirmed: true,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to complete signup right now.");
        }

        setSuccess({
          invoiceNumber: payload?.invoiceNumber ?? "",
          organizationSlug: payload?.organization?.slug ?? "",
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to complete signup right now.");
      }
    });
  };

  const handlePayment = async () => {
    if (!token) {
      setError("Missing signup token. Please use the link from your email.");
      return;
    }
    if (!requiresPayment) {
      handleFinalize();
      return;
    }

    setError("");
    setIsPaymentPending(true);
    try {
      const response = await fetch("/api/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          planSlug: selectedPlan,
          billingEmail,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to start payment right now.");
      }

      const gatewayUrl = payload?.gatewayUrl;
      if (!gatewayUrl) {
        throw new Error("Payment gateway did not return a redirect URL.");
      }

      window.location.href = gatewayUrl;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to start payment right now.");
      setIsPaymentPending(false);
    }
  };

  const planCards = plans.map((plan) => ({
    ...plan,
    seats: plan.team ?? planSeatDefaults[plan.slug] ?? null,
  }));

  const actionLabel = requiresPayment
    ? isPaymentPending
      ? "Redirecting to SSLCommerz…"
      : "Pay with SSLCommerz"
    : isPending
      ? "Finalizing…"
      : "Confirm plan & send invoice";
  const actionDisabled = isPending || isPaymentPending;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#f0f7ff] to-[#f6f3ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_10%_12%,rgba(59,130,246,0.14),transparent),radial-gradient(780px_420px_at_90%_12%,rgba(124,58,237,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Finalize signup</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#0f172a]">
              Choose a plan and confirm invoicing
            </h1>
            <p className="mt-2 text-sm text-[#4b5563]">
              Secure email confirmation received. Select the right plan, confirm payment, and we&apos;ll send your invoice.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
            Email verified
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-card-soft">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            <span className="ml-3 text-sm font-semibold text-[#0f172a]">Loading signup details…</span>
          </div>
        ) : !signup ? (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-semibold">We hit a snag</p>
              <p>{error || "Unable to load signup details."}</p>
            </div>
          </div>
        ) : signup?.status === "COMPLETED" ? (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-6 shadow-card-soft">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-white p-2 text-green-600 shadow">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="space-y-1 text-sm text-green-900">
                <p className="text-lg font-semibold">Workspace already completed</p>
                <p>
                  {signup?.companyName} has already finished signup. You can go to login and access the workspace.
                </p>
                <div className="mt-3">
                  <Button href="/auth/login" variant="secondary">
                    Go to login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-6 shadow-card-soft">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-white p-2 text-green-600 shadow">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="space-y-1 text-sm text-green-900">
                <p className="text-lg font-semibold">Workspace created for {signup?.companyName}</p>
                <p>
                  Invoice {success.invoiceNumber || "generated"} has been emailed. Payment is not required for the Free plan; paid plans can settle using the invoice details.
                </p>
                <p>
                  Invite teammates next. Seat limits are enforced automatically based on your chosen plan.
                </p>
                <div className="mt-3">
                  <Button href="/auth/login" variant="secondary">
                    Go to login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card-soft backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                    Plan selection
                  </p>
                  <p className="text-xl font-bold text-[#0f172a]">
                    {signup?.companyName ?? "Your company"}
                  </p>
                  <p className="text-sm text-[#475569]">
                    Owner: {signup?.name || "Workspace owner"} ({signup?.email})
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  Seat limit enforced
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {planCards.map((plan) => {
                  const isSelected = plan.slug === selectedPlan;
                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => setSelectedPlan(plan.slug)}
                      className={[
                        "flex flex-col gap-2 rounded-2xl border p-4 text-left transition",
                        isSelected
                          ? "border-primary-300 bg-primary-50 shadow-sm"
                          : "border-zinc-200 bg-white hover:border-primary-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-semibold text-[#0f172a]">{plan.name}</p>
                        {plan.highlight ? (
                          <span className="rounded-full bg-primary-100 px-2 py-1 text-[11px] font-semibold text-primary-700">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <p className="text-2xl font-extrabold text-[#0f172a]">
                        {plan.price === 0 ? "BDT 0" : `BDT ${plan.price.toLocaleString()}`}
                        <span className="text-xs font-semibold text-[#6b7280]"> / {plan.period}</span>
                      </p>
                      <p className="text-sm text-[#475569]">{plan.description}</p>
                      <div className="mt-auto rounded-xl bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#0f172a]">
                        {plan.seats ? `${plan.seats} seats included` : "Seat limit based on plan"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-white p-2 text-primary-600 shadow-sm">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0f172a]">Billing contact</p>
                    <p className="text-xs text-[#475569]">We&apos;ll send invoices here.</p>
                    <div className="mt-3">
                      <EmailInput
                        label="Billing email"
                        value={billingEmail}
                        onChange={(event) => setBillingEmail(event.target.value)}
                        placeholder="billing@company.com"
                        name="billingEmail"
                        isRequired
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Invoice preview</p>
                  <p className="text-lg font-bold text-[#0f172a]">Review before confirming</p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {seatLimit} seats
                </span>
              </div>

              <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm text-[#0f172a]">
                <div className="flex items-center justify-between">
                  <span>Plan</span>
                  <span className="font-semibold">{selectedPlanDetails?.name ?? selectedPlan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats included</span>
                  <span className="font-semibold">{seatLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Billing contact</span>
                  <span className="font-semibold">{billingEmail || signup?.email}</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3">
                  <span className="font-semibold text-[#475569]">Monthly amount</span>
                  <span className="text-xl font-extrabold text-[#0f172a]">
                    {planPrice === 0 ? "BDT 0" : `BDT ${planPrice.toLocaleString()}`}
                  </span>
                </div>
                <p className="text-xs text-[#6b7280]">
                  Invoice will be emailed immediately. Payment confirmation is skipped for the Free plan.
                </p>
              </div>

              {requiresPayment ? (
                <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[#0f172a]">
                  <CreditCard className="mt-1 h-4 w-4 text-primary-600" />
                  <span>
                    You&apos;ll be redirected to SSLCommerz to complete payment securely. An invoice will also be emailed to{" "}
                    {billingEmail || signup?.email}.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No payment required for the Free plan. Invoice will still be issued for records.</span>
                </div>
              )}

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="button"
                fullWidth
                rightIcon={actionDisabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                disabled={actionDisabled}
                onClick={requiresPayment ? handlePayment : handleFinalize}
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
