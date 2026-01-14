"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ComponentType,
  type SVGProps,
} from "react";
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, CreditCard, Loader2, Mail, Users } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import EmailInput from "@/app/components/inputs/EmailInput";
import PasswordInput from "@/app/components/inputs/PasswordInput";
import TextInput from "@/app/components/inputs/TextInput";
import SelectBox from "@/app/components/inputs/SelectBox";
import TextArea from "@/app/components/inputs/TextArea";

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

const flowSteps: Highlight[] = [
  {
    title: "Secure email confirmation",
    description: "We send you a verification link to complete signup.",
    icon: Mail,
  },
  {
    title: "Choose your plan",
    description: "Select Free, Standard, or Premium and review seats.",
    icon: CreditCard,
  },
  {
    title: "Invoice issued",
    description: "Formal invoice emailed instantly. Payment not needed for Free.",
    icon: BadgeCheck,
  },
  {
    title: "Invite your team",
    description: "Seat limits are enforced automatically per plan.",
    icon: Users,
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
      className="border-zinc-200 text-zinc-400 shadow-none hover:border-zinc-200 hover:shadow-none"
      disabled
    >
      {label}
    </Button>
  );
}

type FormState = {
  name: string;
  personalEmail: string;
  companyEmail: string;
  companyPhone: string;
  password: string;
  phone: string;
  company: string;
  companySlug: string;
  website: string;
  domain: string;
  industry: string;
  description: string;
  address: string;
  region: string;
  billingEmail: string;
  designation: string;
  companySize: string;
  preferredPlan: string;
  logoKey: string;
  logoUrl: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.replace(role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    }
  }, [status, session, router]);

  const [form, setForm] = useState<FormState>({
    name: "",
    personalEmail: "",
    companyEmail: "",
    companyPhone: "",
    password: "",
    phone: "",
    company: "",
    companySlug: "",
    website: "",
    domain: "",
    industry: "",
    description: "",
    address: "",
    region: "",
    billingEmail: "",
    designation: "",
    companySize: "",
    preferredPlan: "standard",
    logoKey: "",
    logoUrl: "",
  });
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [billingEmailTouched, setBillingEmailTouched] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!billingEmailTouched) {
      setForm((prev) => ({ ...prev, billingEmail: prev.companyEmail }));
    }
  }, [billingEmailTouched, form.companyEmail]);

  const handleChange =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      if (key === "billingEmail") {
        setBillingEmailTouched(true);
      }
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError("");
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo must be 5MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("contentType", file.type);

    setLogoUploading(true);
    try {
      const response = await fetch("/api/jobs/upload-url?purpose=company-logo", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to upload logo right now.");
      }
      const publicUrl = payload?.publicUrl ?? "";
      const logoKey = payload?.key ?? "";
      setForm((prev) => ({ ...prev, logoUrl: publicUrl, logoKey }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setLogoError(err instanceof Error ? err.message : "Unable to upload logo right now.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setServerMessage("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            personalEmail: form.personalEmail,
            companyEmail: form.companyEmail,
            password: form.password,
            phone: form.phone,
            companyName: form.company,
            companySlug: form.companySlug,
            website: form.website,
            domain: form.domain,
            industry: form.industry,
            description: form.description,
            address: form.address,
            region: form.region,
            billingEmail: form.billingEmail || form.companyEmail,
            logoKey: form.logoKey,
            logoUrl: form.logoUrl,
            designation: form.designation,
            companySize: form.companySize,
            companyPhone: form.companyPhone,
            preferredPlan: form.preferredPlan,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          const message = payload?.error ?? "Unable to start signup right now.";
          setError(message);
          return;
        }

        setSent(true);
        setSubmittedEmail(form.personalEmail);
        setServerMessage(payload?.message ?? "Confirmation email sent.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to start signup right now. Please try again in a moment.";
        setError(message);
      }
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#fef5ff] to-[#eef4ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_20%,rgba(216,8,128,0.08),transparent),radial-gradient(800px_420px_at_90%_12%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-[#1c0e2a] via-[#2d1744] to-[#0f1b35] p-10 text-white shadow-card-soft">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_25%_20%,rgba(216,8,128,0.22),transparent),radial-gradient(800px_420px_at_80%_12%,rgba(124,58,237,0.35),transparent)]" />
            <div className="relative space-y-6 text-left">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Create account
              </span>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                Launch your carriX workspace with billing-ready signup
              </h1>
              <p className="max-w-xl text-sm text-white/80">
                Create a company owner account, confirm via email, choose a plan, and get an invoice instantly. Seat limits are enforced so you can invite teammates confidently.
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
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900">Create your carriX workspace</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Submit owner details. We&apos;ll email a secure link to finalize plan, invoice, and payment.
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  Free plan available
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

              {sent ? (
                <div className="space-y-4 rounded-2xl border border-green-100 bg-green-50/70 p-4 text-sm text-green-900">
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-white/60 p-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-green-800">
                        Confirmation sent to {submittedEmail || "your email"}.
                      </p>
                      <p className="text-green-700">
                        Follow the link in your inbox to select a plan, review the invoice, and confirm payment (skipped for Free). Seat limits will be applied automatically.
                      </p>
                    </div>
                  </div>
                  {serverMessage ? <p className="text-green-700">{serverMessage}</p> : null}
                  <div className="rounded-xl border border-green-200 bg-white/90 p-3">
                    <p className="text-xs font-semibold text-green-800 uppercase tracking-[0.18em]">Next steps</p>
                    <ul className="mt-2 space-y-2 text-sm text-green-800">
                      <li>1. Open the confirmation email and complete signup.</li>
                      <li>2. Choose your plan and review the invoice.</li>
                      <li>3. Invite team members within your seat limit.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Full name"
                      name="name"
                      placeholder="Your name"
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange("name")}
                      isRequired
                    />
                    <EmailInput
                      label="Personal email (for login)"
                      name="personalEmail"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={form.personalEmail}
                      onChange={handleChange("personalEmail")}
                      isRequired
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <EmailInput
                      label="Company email"
                      name="companyEmail"
                  placeholder="you@company.com"
                  autoComplete="work"
                  value={form.companyEmail}
                  onChange={handleChange("companyEmail")}
                  isRequired
                />
                <TextInput
                  label="Personal phone (optional)"
                  name="phone"
                  placeholder="+880 1700 123 456"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label="Company phone (optional)"
                  name="companyPhone"
                  placeholder="+880 1700 123 456"
                  value={form.companyPhone}
                  onChange={handleChange("companyPhone")}
                />
                <TextInput
                  label="Company slug (optional)"
                  name="companySlug"
                  placeholder="acme-hiring"
                  value={form.companySlug}
                  onChange={handleChange("companySlug")}
                  helperText="Used for your workspace URL if available"
                />
              </div>

                  <PasswordInput
                    label="Password"
                    name="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange("password")}
                    isRequired
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Company"
                      name="company"
                  placeholder="Acme Corp"
                  autoComplete="organization"
                  value={form.company}
                  onChange={handleChange("company")}
                  isRequired
                />
                <TextInput
                  label="Designation"
                  name="designation"
                  placeholder="Head of Talent"
                  autoComplete="organization-title"
                  value={form.designation}
                  onChange={handleChange("designation")}
                />
              </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Website (optional)"
                      name="website"
                      placeholder="https://company.com"
                      value={form.website}
                      onChange={handleChange("website")}
                    />
                    <TextInput
                      label="Domain (optional)"
                      name="domain"
                      placeholder="company.com"
                      value={form.domain}
                      onChange={handleChange("domain")}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Industry (optional)"
                      name="industry"
                      placeholder="HR Tech · AI"
                      value={form.industry}
                      onChange={handleChange("industry")}
                    />
                    <TextInput
                      label="Region (optional)"
                      name="region"
                      placeholder="APAC"
                  value={form.region}
                  onChange={handleChange("region")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectBox
                  label="Company size"
                  name="companySize"
                  placeholder="Select company size"
                  value={form.companySize}
                  onChange={handleChange("companySize")}
                  options={[
                    { value: "1-10", label: "1 - 10 people" },
                    { value: "11-50", label: "11 - 50 people" },
                    { value: "51-200", label: "51 - 200 people" },
                    { value: "200+", label: "200+ people" },
                      ]}
                    />
                    <SelectBox
                      label="Preferred plan"
                      name="preferredPlan"
                      value={form.preferredPlan}
                      onChange={handleChange("preferredPlan")}
                      options={[
                        { value: "free", label: "Free · 1 seat · BDT 0" },
                        { value: "standard", label: "Standard · 5 seats · BDT 7,500" },
                        { value: "premium", label: "Premium · 10 seats · BDT 15,000" },
                      ]}
                    />
                  </div>

                  <TextArea
                    label="Company description (optional)"
                    name="description"
                    placeholder="AI-first hiring suite powering resume scoring, shortlist recommendations, and recruiter workflows."
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows={4}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Billing email"
                      name="billingEmail"
                      placeholder="billing@company.com"
                      value={form.billingEmail || form.companyEmail}
                      onChange={handleChange("billingEmail")}
                      isRequired
                    />
                    <TextInput
                      label="Address"
                      name="address"
                      placeholder="123 Main Street, City"
                      value={form.address}
                      onChange={handleChange("address")}
                      isRequired
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">Company logo (optional)</p>
                        <p className="text-xs text-zinc-600">Images only. Max 5MB.</p>
                      </div>
                      {form.logoUrl ? (
                        <span className="text-xs font-semibold text-green-700">Uploaded</span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {form.logoUrl ? (
                          <img src={form.logoUrl} alt="Company logo preview" className="h-14 w-14 rounded-lg object-cover" />
                        ) : (
                          <span className="grid h-14 w-14 place-items-center rounded-lg border border-dashed border-zinc-300 text-zinc-400">
                            <Mail className="h-5 w-5" />
                          </span>
                        )}
                        <div className="text-xs text-zinc-600">
                          <p className="font-semibold text-zinc-800">Upload PNG, JPG, or WebP</p>
                          <p>Used on invoices and your workspace.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={logoUploading}
                        >
                          {logoUploading ? "Uploading…" : "Upload logo"}
                        </Button>
                      </div>
                    </div>
                    {logoError ? (
                      <p className="mt-2 text-xs font-semibold text-amber-700">{logoError}</p>
                    ) : null}
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    fullWidth
                    rightIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    disabled={isPending}
                  >
                    {isPending ? "Sending confirmation…" : "Send confirmation email"}
                  </Button>
                </form>
              )}

              <div className="mt-8 grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                {flowSteps.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 rounded-full bg-white p-2 text-primary-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-zinc-900">{title}</p>
                      <p className="text-zinc-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 text-center text-sm text-zinc-600">
                <p>
                  By creating an account, you agree to our platform guidelines and data handling practices.
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
