"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AlertTriangle, Building2, CheckCircle2, Globe2, Mail, ShieldCheck } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";
import TextArea from "@/app/components/inputs/TextArea";

type CompanyForm = {
  name: string;
  website: string;
  domain: string;
  industry: string;
  size: string;
  region: string;
  hqLocation: string;
  billingEmail: string;
  phone: string;
  description: string;
};

const initialCompany: CompanyForm = {
  name: "carriX Labs",
  website: "https://carrix.ai",
  domain: "carrix.ai",
  industry: "HR Tech · AI",
  size: "51-200",
  region: "APAC",
  hqLocation: "Dhaka, Bangladesh",
  billingEmail: "billing@carrix.ai",
  phone: "+880 1700 123 456",
  description:
    "AI-first hiring suite powering resume scoring, shortlist recommendations, and recruiter workflows.",
};

export default function CompanyPage() {
  const { data: session, status } = useSession();
  const role = (session as any)?.user?.role as string | undefined;
  const organizationId = (session as any)?.user?.organizationId as string | undefined;
  const [form, setForm] = useState<CompanyForm>(initialCompany);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const isCompanyAdmin = role === "COMPANY_ADMIN";

  const handleChange =
    (key: keyof CompanyForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSavedAt(null);
    // TODO: replace with real API call to persist organization settings
    setTimeout(() => {
      setIsSaving(false);
      setSavedAt(Date.now());
    }, 500);
  };

  const saveMessage = useMemo(() => {
    if (!savedAt) return null;
    const date = new Date(savedAt);
    return `Changes saved · ${date.toLocaleTimeString()}`;
  }, [savedAt]);

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-card-soft backdrop-blur">
        <p className="text-sm font-semibold text-[#1f2a44]">Loading company settings…</p>
      </div>
    );
  }

  if (!isCompanyAdmin) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-6 text-amber-800 shadow-card-soft">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Restricted</p>
            <p className="text-sm text-amber-700">Only company admins can view or edit company details.</p>
          </div>
        </div>
        <Button href="/dashboard" variant="secondary" size="sm" className="mt-4">
          Go back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#fef8ff] via-[#f5f6ff] to-white p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-primary-100/60 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-36 w-36 rounded-full bg-[#e5e9ff] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
              <ShieldCheck className="h-4 w-4" />
              Workspace controls
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44]">
              Company profile & billing details
            </h1>
            <p className="max-w-2xl text-sm text-[#5c5177]">
              Keep your organization record up to date. Changes here apply to invoices, notification branding,
              and teammate defaults across your workspace.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a90a6]">Workspace ID</p>
            <p className="mt-1 text-lg font-semibold text-[#1f2a44]">
              {organizationId ?? "—"}
            </p>
            <p className="text-xs text-[#8a90a6]">Shared with support for billing or compliance queries.</p>
          </div>
        </div>
      </section>

      {saveMessage ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">{saveMessage}</span>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1f2a44]">Basic details</p>
                <p className="text-xs text-[#6b7280]">Name, domain, and public-facing info.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Company name"
                value={form.name}
                onChange={handleChange("name")}
                isRequired
              />
              <TextInput
                label="Website"
                value={form.website}
                onChange={handleChange("website")}
                type="url"
                helperText="Used in candidate communication."
              />
              <TextInput
                label="Primary domain"
                value={form.domain}
                onChange={handleChange("domain")}
                helperText="For SSO and email validation."
              />
              <TextInput
                label="Industry"
                value={form.industry}
                onChange={handleChange("industry")}
              />
              <TextInput
                label="Company size"
                value={form.size}
                onChange={handleChange("size")}
              />
            </div>

            <TextArea
              label="About the company"
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              helperText="Visible to teammates to align messaging."
            />
          </div>

          <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
                <Globe2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1f2a44]">Locations</p>
                <p className="text-xs text-[#6b7280]">Primary office and hiring region.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="HQ location"
                value={form.hqLocation}
                onChange={handleChange("hqLocation")}
              />
              <TextInput
                label="Operating region"
                value={form.region}
                onChange={handleChange("region")}
                helperText="Used for time zone defaults."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4f8] text-[#d80880]">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1f2a44]">Billing & contacts</p>
                <p className="text-xs text-[#6b7280]">Where invoices and alerts are sent.</p>
              </div>
            </div>

            <TextInput
              label="Billing email"
              value={form.billingEmail}
              onChange={handleChange("billingEmail")}
              type="email"
              isRequired
            />
            <TextInput
              label="Phone"
              value={form.phone}
              onChange={handleChange("phone")}
              type="tel"
            />
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1f2a44]">Compliance & support</p>
                <p className="text-xs text-[#6b7280]">
                  Keep org details current to speed up support, billing, and audits.
                </p>
                <p className="text-xs font-semibold text-primary-600">
                  Need a change log? Share your workspace ID with support.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary-500" />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm(initialCompany)}
            >
              Reset changes
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save company profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
