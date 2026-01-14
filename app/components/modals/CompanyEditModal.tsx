import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertTriangle, Building2, Globe2, Mail, ShieldCheck, X } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextArea from "@/app/components/inputs/TextArea";
import TextInput from "@/app/components/inputs/TextInput";
import type { CompanyForm } from "@/app/types/company";

const defaultLogo = "/logo/carriastic_logo.png";
const logoBaseUrl = (process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

const resolveLogo = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return defaultLogo;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  const normalized = trimmed.replace(/^\/+/, "");
  return logoBaseUrl ? `${logoBaseUrl}/${normalized}` : `/${normalized}`;
};

type CompanyEditModalProps = {
  open: boolean;
  onClose: () => void;
  form: CompanyForm;
  onChange: (key: keyof CompanyForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLogoSelect: (file: File) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  isSaving: boolean;
  loading: boolean;
  saveError?: string;
  logoPreview: string;
  isLogoPending: boolean;
};

type SectionProps = {
  icon: ReactNode;
  title: string;
  helper: string;
  children: ReactNode;
};

function SectionCard({ icon, title, helper, children }: SectionProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card-soft">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold text-[#1f2a44]">{title}</p>
          <p className="text-xs text-[#6b7280]">{helper}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function CompanyEditModal({
  open,
  onClose,
  form,
  onChange,
  onLogoSelect,
  onSubmit,
  onReset,
  isSaving,
  loading,
  saveError,
  logoPreview,
  isLogoPending,
}: CompanyEditModalProps) {
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setLogoError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleLogoPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError("");
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file (PNG, JPG, WebP, or SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo must be 5MB or smaller.");
      return;
    }
    onLogoSelect(file);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-edit-title"
      className={`fixed inset-0 z-50 flex items-start justify-center bg-[#0f172a]/40 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative mx-auto mt-6 w-[min(1100px,calc(100%-2rem))] max-h-[90vh] transform transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex max-h-[90vh] min-h-[60vh] flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_32px_100px_rgba(24,27,49,0.22)]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#EEF2F7] bg-gradient-to-r from-[#fef8ff] via-[#f5f6ff] to-white px-6 py-5 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
                <ShieldCheck className="h-4 w-4" />
                Company controls
              </div>
              <div>
                <h2 id="company-edit-title" className="text-xl font-semibold text-[#1f2a44]">
                  Edit company profile
                </h2>
                <p className="text-sm text-[#5c5177]">
                  Update billing contacts, brand info, and workspace defaults in one place.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#6b7280] transition hover:bg-[#f2f4f7] hover:text-[#1f2a44]"
              aria-label="Close company edit modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {saveError ? (
              <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50/80 px-4 py-3 text-danger-700 shadow-sm">
                <AlertTriangle className="h-4 w-4 text-danger-500" />
                <span className="text-sm font-semibold">{saveError}</span>
              </div>
            ) : null}

            <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-card-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#EEF2F7] bg-[#f8fafc]">
                    <Image
                      src={logoPreview}
                      alt="Company logo preview"
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                      onError={() => setLogoError("Unable to preview logo.")}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#1f2a44]">Workspace logo</p>
                    <p className="text-xs text-[#6b7280]">
                      Shown at the top of your workspace and on invoices. Upload is saved when you click “Save company
                      profile”.
                    </p>
                    {logoError ? <p className="text-xs font-semibold text-danger-600">{logoError}</p> : null}
                    {isLogoPending ? <p className="text-[11px] font-semibold text-primary-700">Pending upload</p> : null}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoPick}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || isSaving}
                  >
                    Choose logo
                  </Button>
                  <p className="text-[11px] text-[#6b7280]">PNG, JPG, WebP, or SVG · Max 5MB. Upload on save.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <SectionCard
                  icon={<span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600"><Building2 className="h-5 w-5" /></span>}
                  title="Basic details"
                  helper="Name, domain, and public-facing info."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput
                      label="Company name"
                      value={form.name}
                      onChange={onChange("name")}
                      isRequired
                      disabled={loading}
                    />
                    <TextInput
                      label="Website"
                      value={form.website}
                      onChange={onChange("website")}
                      type="url"
                      helperText="Used in candidate communication."
                      disabled={loading}
                    />
                    <TextInput
                      label="Primary domain"
                      value={form.domain}
                      onChange={onChange("domain")}
                      helperText="For SSO and email validation."
                      disabled={loading}
                    />
                    <TextInput
                      label="Industry"
                      value={form.industry}
                      onChange={onChange("industry")}
                      disabled={loading}
                    />
                    <TextInput
                      label="Company size"
                      value={form.size}
                      onChange={onChange("size")}
                      disabled={loading}
                    />
                  </div>

                  <TextArea
                    label="About the company"
                    value={form.description}
                    onChange={onChange("description")}
                    rows={4}
                    helperText="Visible to teammates to align messaging."
                    disabled={loading}
                  />
                </SectionCard>

                <SectionCard
                  icon={<span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]"><Globe2 className="h-5 w-5" /></span>}
                  title="Locations"
                  helper="Primary office and hiring region."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput
                      label="HQ location"
                      value={form.hqLocation}
                      onChange={onChange("hqLocation")}
                      disabled={loading}
                    />
                    <TextInput
                      label="Operating region"
                      value={form.region}
                      onChange={onChange("region")}
                      helperText="Used for time zone defaults."
                      disabled={loading}
                    />
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard
                  icon={<span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4f8] text-[#d80880]"><Mail className="h-5 w-5" /></span>}
                  title="Billing & contacts"
                  helper="Where invoices and alerts are sent."
                >
                  <TextInput
                    label="Company email"
                    value={form.companyEmail}
                    onChange={onChange("companyEmail")}
                    type="email"
                    isRequired
                    helperText="Used for official workspace communication."
                    disabled={loading}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Billing email"
                      value={form.billingEmail}
                      onChange={onChange("billingEmail")}
                      type="email"
                      isRequired
                      disabled={loading}
                    />
                    <TextInput
                      label="Phone"
                      value={form.phone}
                      onChange={onChange("phone")}
                      type="tel"
                      helperText="Main company contact number."
                      disabled={loading}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3fbf7] text-[#1B806A]"><ShieldCheck className="h-5 w-5" /></span>}
                  title="Compliance & support"
                  helper="Keep org details current to speed up support, billing, and audits."
                >
                  <p className="text-sm text-[#1f2a44]">
                    Workspace identity and billing metadata sync to invoices, alerts, and teammate defaults. Share your
                    workspace ID with support for change logs.
                  </p>
                </SectionCard>

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setLogoError("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      onReset();
                    }}
                    disabled={loading || isSaving}
                  >
                    Reset changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || loading}
                  >
                    {isSaving ? "Saving…" : "Save company profile"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
