"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ComponentType, FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle2,
  Eye,
  Globe2,
  Loader2,
  Mail,
  PencilLine,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Wallet,
  BarChart3,
  Users2,
  X,
} from "lucide-react";
import Button from "@/app/components/buttons/Button";
import { CompanyEditModal } from "@/app/components/modals/CompanyEditModal";
import SelectBox from "@/app/components/inputs/SelectBox";
import type { CompanyForm } from "@/app/types/company";

const defaultLogo = "/logo/carriastic_logo.png";
const defaultAvatar = "/images/default_dp.png";

const initialCompany: CompanyForm = {
  name: "carriX Labs",
  website: "https://carrix.ai",
  logo: defaultLogo,
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

const displayValue = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : "Not set";
};

const formatNumber = (value: number) => value.toLocaleString();

const parseTeamLimit = (value?: string | number | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return null;
  const match = String(value).match(/(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

type DetailItem = {
  label: string;
  value?: string;
  helper?: string;
  isLink?: boolean;
  span?: boolean;
};

type DetailCardProps = {
  title: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  items: DetailItem[];
};

type MemberRecord = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  isOwner?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
};

const formatRole = (value?: string, isOwner?: boolean) => {
  if (isOwner) return "Owner";
  if (!value) return "—";
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super admin",
    COMPANY_ADMIN: "Company admin",
    COMPANY_MEMBER: "Member",
    VIEWER: "Viewer",
  };
  return map[value] ?? value
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatStatus = (value?: string) => {
  if (!value) return "—";
  const map: Record<string, string> = {
    ACTIVE: "Active",
    PENDING: "Pending",
    DISABLED: "Disabled",
  };
  return map[value] ?? value.toLowerCase();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const memberInitial = (name?: string, fallback?: string) => {
  const source = (name || fallback || "?").trim();
  return source.charAt(0).toUpperCase() || "?";
};

const resolveLogo = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : defaultLogo;
};

const resolveAvatar = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : defaultAvatar;
};

type SparklineProps = { data: number[]; color?: string };

function Sparkline({ data, color = "#3D64FF" }: SparklineProps) {
  const sanitized = data.length ? data : [0];
  const max = Math.max(...sanitized);
  const min = Math.min(...sanitized);
  const height = 44;
  const width = 140;
  const range = Math.max(max - min, 1);
  const denominator = Math.max(sanitized.length - 1, 1);

  const points = sanitized
    .map((value, index) => {
      const x = (index / denominator) * width;
      const y = height - ((value - min) / range) * (height - 10) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <polyline fill="none" stroke="#E3E8FF" strokeWidth="2" points={`0,${height - 6} ${width},${height - 6}`} />
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}

type BarData = { label: string; value: number };

function MiniBarChart({ data, accent = "#3D64FF" }: { data: BarData[]; accent?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-16 text-xs font-semibold text-[#6b7280]">{item.label}</span>
          <div className="relative h-2 flex-1 rounded-full bg-[#EEF2F7]">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: accent }}
            />
          </div>
          <span className="w-14 text-right text-xs font-semibold text-[#1f2a44]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressMeter({ value, limit, label }: { value: number; limit: number; label: string }) {
  const percent = limit > 0 ? Math.min(100, Math.round((value / limit) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#4b5563]">
        <span>{label}</span>
        <span>
          {value} / {limit} · {percent}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EEF2F7]">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#3D64FF] to-[#7b6dff]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  accent = "primary",
  footer,
}: {
  title: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "primary" | "emerald" | "amber" | "indigo";
  footer?: ReactNode;
}) {
  const accentMap: Record<"primary" | "emerald" | "amber" | "indigo", string> = {
    primary: "bg-primary-50 text-primary-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-card-soft">
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {footer}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a90a6]">{title}</p>
        <p className="text-2xl font-semibold text-[#1f2a44]">{value}</p>
        <p className="text-xs text-[#6b7280]">{helper}</p>
      </div>
    </div>
  );
}

function DetailCard({ title, helper, icon: Icon, items }: DetailCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1f2a44]">{title}</p>
          <p className="text-xs text-[#6b7280]">{helper}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const hasValue = Boolean(item.value && item.value.trim().length);
          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-card-soft ${item.span ? "sm:col-span-2" : ""}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">{item.label}</p>
              {item.isLink && hasValue ? (
                <a
                  href={item.value}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-sm text-[#1f2a44]">{displayValue(item.value)}</p>
              )}
              {item.helper ? <p className="text-xs text-[#6b7280]">{item.helper}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type MemberDetailsModalProps = {
  open: boolean;
  member: MemberRecord | null;
  onClose: () => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  error?: string;
  canEditRole: boolean;
  restrictionNote?: string;
  roleOptions: { label: string; value: string; disabled?: boolean }[];
};

function MemberDetailsModal({
  open,
  member,
  onClose,
  selectedRole,
  onRoleChange,
  onSave,
  isSaving,
  error,
  canEditRole,
  restrictionNote,
  roleOptions,
}: MemberDetailsModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  const avatarSrc = resolveAvatar(member?.image);
  const avatarAlt = member?.name ?? member?.email ?? "Member avatar";
  const roleLabel = formatRole(member?.role, member?.isOwner);
  const statusLabel = formatStatus(member?.status);
  const saveDisabled = !member || isSaving || selectedRole === member.role || !canEditRole;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-details-title"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0f172a]/40 p-4 py-10 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative mx-auto w-[min(680px,calc(100%-2rem))] max-h-[90vh] transform transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_28px_70px_rgba(24,27,49,0.22)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] bg-gradient-to-r from-[#fef8ff] via-[#f5f6ff] to-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#EEF2F7] bg-primary-50 text-lg font-semibold text-primary-700">
                <span className="absolute inset-0 grid place-items-center text-primary-700">
                  {member ? memberInitial(member.name, member.email) : "?"}
                </span>
                <Image
                  src={avatarSrc}
                  alt={avatarAlt}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 id="member-details-title" className="text-lg font-semibold text-[#1f2a44]">
                  {member?.name ?? "Member details"}
                </h2>
                <p className="text-xs text-[#6b7280]">{member?.email ?? "Select a member to view details"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#6b7280] transition hover:bg-[#f2f4f7] hover:text-[#1f2a44]"
              aria-label="Close member details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <div className="flex items-center gap-2 border-b border-danger-100 bg-danger-50/70 px-6 py-3 text-danger-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          ) : null}

          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Role</p>
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{roleLabel}</p>
                <p className="text-xs text-[#6b7280]">
                  {member?.isOwner ? "Workspace owner" : "Current permission level"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Status</p>
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{statusLabel}</p>
                <p className="text-xs text-[#6b7280]">Invites and access are tied to this status.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Joined</p>
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{formatDate(member?.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Last active</p>
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{formatDate(member?.lastActiveAt)}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-4 shadow-inner">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1f2a44]">Change member role</p>
                  <p className="text-xs text-[#6b7280]">Updates apply immediately for this workspace.</p>
                  {restrictionNote ? (
                    <p className="text-xs font-semibold text-danger-600">{restrictionNote}</p>
                  ) : null}
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                  {roleLabel}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <SelectBox
                  label="Member role"
                  value={selectedRole}
                  onChange={(event) => onRoleChange(event.target.value)}
                  options={roleOptions}
                  disabled={!canEditRole || isSaving || !member}
                  helperText={
                    canEditRole
                      ? "Select a new permission level for this teammate."
                      : "You don't have permission to change this member."
                  }
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={onSave}
                    disabled={saveDisabled}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CompanyPage() {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { id?: string; role?: string; organizationId?: string } | undefined;
  const role = sessionUser?.role;
  const userId = sessionUser?.id ?? null;
  const organizationId = sessionUser?.organizationId;
  const isMountedRef = useRef(true);
  const [form, setForm] = useState<CompanyForm>(initialCompany);
  const [initialData, setInitialData] = useState<CompanyForm>(initialCompany);
  const [orgId, setOrgId] = useState<string | null>(organizationId ?? null);
  const [orgOwnerId, setOrgOwnerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [memberActionError, setMemberActionError] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [planSnapshot, setPlanSnapshot] = useState({
    name: "Standard",
    renewal: "Renews soon",
    seatLimit: 5,
    creditBalance: 1240,
    currency: "credits",
    cvSortedTotal: 4280,
    cvSortedThisMonth: 320,
    cvSortedTarget: 500,
  });
  const canInviteMore = members.length < planSnapshot.seatLimit;

  const isCompanyAdmin = role === "COMPANY_ADMIN";

  const mapOrgToForm = (payload: Partial<CompanyForm>): CompanyForm => ({
    name: payload.name ?? "",
    website: payload.website ?? "",
    logo: payload.logo ?? defaultLogo,
    domain: payload.domain ?? "",
    industry: payload.industry ?? "",
    size: payload.size ?? "",
    region: payload.region ?? "",
    hqLocation: payload.hqLocation ?? "",
    billingEmail: payload.billingEmail ?? "",
    phone: payload.phone ?? "",
    description: payload.description ?? "",
  });

  const handleChange =
    (key: keyof CompanyForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const loadCompany = useCallback(async () => {
    if (status === "loading") return;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/company");
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          return;
        }
        throw new Error(payload?.error ?? "Unable to load company");
      }
      const company = mapOrgToForm(payload?.organization ?? {});
      if (isMountedRef.current) {
        setForm(company);
        setInitialData(company);
        setOrgId((payload?.organization?.id as string | undefined) ?? organizationId ?? null);
        setSavedAt(null);
        const planFromPayload = payload?.organization?.plan as { name?: string; slug?: string; team?: string | number } | undefined;
        const planName =
          (planFromPayload?.name && planFromPayload.name.trim()) ||
          (planFromPayload?.slug && planFromPayload.slug.trim()) ||
          "Standard";
        const teamLimit =
          parseTeamLimit(planFromPayload?.team) ??
          (typeof payload?.organization?.seatLimit === "number" ? payload.organization.seatLimit : null);
        const creditBalanceFromPayload =
          typeof payload?.organization?.creditsBalance === "number" ? payload.organization.creditsBalance : null;
        setPlanSnapshot((prev) => ({
          ...prev,
          name: planName,
          seatLimit: teamLimit ?? prev.seatLimit,
          creditBalance: creditBalanceFromPayload ?? prev.creditBalance,
        }));
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setLoadError("Unable to load company details right now. Please try again in a moment.");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [organizationId, status]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  useEffect(() => {
    const handleRefresh = () => {
      loadCompany();
    };
    window.addEventListener("company:refresh", handleRefresh);
    return () => {
      window.removeEventListener("company:refresh", handleRefresh);
    };
  }, [loadCompany]);

  useEffect(() => {
    let isActive = true;
    const loadMembers = async () => {
      if (status === "loading") return;
      if (status !== "authenticated") {
        if (isActive) {
          setMembers([]);
          setOrgOwnerId(null);
          setMembersLoading(false);
        }
        return;
      }
      if (!isCompanyAdmin) {
        if (isActive) {
          setMembers([]);
          setOrgOwnerId(null);
          setMembersLoading(false);
          setMembersError("");
        }
        return;
      }
      setMembersLoading(true);
      setMembersError("");
      try {
        const response = await fetch("/api/company/members");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load members");
        }
        if (isActive) {
          type MemberPayload = {
            id?: string;
            user?: { id?: string | null; name?: string | null; email?: string | null; image?: string | null } | null;
            role?: string;
            status?: string;
            createdAt?: string;
            lastActiveAt?: string;
          };
          const membersPayload: MemberPayload[] = Array.isArray(payload?.members) ? payload.members : [];
          const ownerId = typeof payload?.ownerId === "string" ? payload.ownerId : null;

          const mapped = membersPayload.map((member, index) => ({
            id: member.id ?? `member-${index}`,
            userId: member.user?.id ?? `user-${index}`,
            name: member.user?.name ?? "Unknown",
            email: member.user?.email ?? "—",
            image: member.user?.image ?? null,
            role: member.role ?? "",
            status: member.status ?? "",
            createdAt: member.createdAt,
            lastActiveAt: member.lastActiveAt,
            isOwner: ownerId ? member.user?.id === ownerId : false,
          }));
          setMembers(mapped);
          setOrgOwnerId(ownerId);
        }
      } catch (error) {
        console.error(error);
        if (isActive) {
          setMembersError("Unable to load members right now. Please try again in a moment.");
        }
      } finally {
        if (isActive) setMembersLoading(false);
      }
    };

    loadMembers();
    return () => {
      isActive = false;
    };
  }, [status, isCompanyAdmin]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSavedAt(null);
    setSaveError("");

    try {
      const response = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to save company");
      }
      const company = mapOrgToForm(payload?.organization ?? form);
      setForm(company);
      setInitialData(company);
      setSavedAt(Date.now());
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      setSaveError((error as Error)?.message ?? "Unable to save company");
    } finally {
      setIsSaving(false);
    }
  };

  const saveMessage = useMemo(() => {
    if (!savedAt) return null;
    const date = new Date(savedAt);
    return `Changes saved · ${date.toLocaleTimeString()}`;
  }, [savedAt]);
  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  useEffect(() => {
    if (selectedMember) {
      setSelectedRole(selectedMember.role);
    } else {
      setSelectedRole("");
    }
    setMemberActionError("");
  }, [selectedMember]);

  const roleOptions = useMemo(
    () => [
      { label: "Company admin", value: "COMPANY_ADMIN" },
      { label: "Member", value: "COMPANY_MEMBER" },
      { label: "Viewer", value: "VIEWER" },
    ],
    []
  );

  const actorIsOwner = Boolean(orgOwnerId && userId && orgOwnerId === userId);
  const actorCanManageMembers = isCompanyAdmin || actorIsOwner;
  const selectedMemberIsOwner = selectedMember ? orgOwnerId === selectedMember.userId : false;

  const canEditSelectedMemberRole = useMemo(() => {
    if (!selectedMember) return false;
    if (!actorCanManageMembers) return false;
    if (selectedMemberIsOwner) {
      if (!actorIsOwner) return false;
      if (selectedMember.userId === userId) return false;
    }
    return true;
  }, [selectedMember, actorCanManageMembers, selectedMemberIsOwner, actorIsOwner, userId]);

  const roleRestrictionNote = useMemo(() => {
    if (!selectedMember) return undefined;
    if (!actorCanManageMembers) {
      return "Only workspace admins can change member roles.";
    }
    if (selectedMemberIsOwner && !actorIsOwner) {
      return "Only another owner can change an owner's role.";
    }
    if (selectedMemberIsOwner && selectedMember.userId === userId) {
      return "Another owner must change your role.";
    }
    return undefined;
  }, [selectedMember, actorCanManageMembers, selectedMemberIsOwner, actorIsOwner, userId]);

  const applyOwnerFlag = (list: MemberRecord[], owner: string | null) =>
    list.map((member) => ({ ...member, isOwner: owner ? member.userId === owner : false }));

  const openMemberModal = (memberId: string) => {
    const member = members.find((item) => item.id === memberId);
    setSelectedMemberId(memberId);
    setSelectedRole(member?.role ?? "");
    setMemberActionError("");
  };

  const closeMemberModal = () => {
    setSelectedMemberId(null);
    setSelectedRole("");
    setMemberActionError("");
  };

  const handleMemberRoleSave = async () => {
    if (!selectedMember) return;
    if (!canEditSelectedMemberRole) {
      setMemberActionError("You don't have permission to change this role.");
      return;
    }
    if (!selectedRole || selectedRole === selectedMember.role) {
      closeMemberModal();
      return;
    }

    setIsSavingMember(true);
    setMemberActionError("");

    try {
      const response = await fetch("/api/company/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember.id, role: selectedRole }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update member");
      }

      const updatedMember = payload?.member as {
        id?: string;
        role?: string;
        status?: string;
        createdAt?: string;
        lastActiveAt?: string;
        user?: { id?: string | null; name?: string | null; email?: string | null };
      } | null;
      const ownerId = typeof payload?.ownerId === "string" ? payload.ownerId : orgOwnerId;

      setOrgOwnerId(ownerId ?? null);

      if (updatedMember?.id) {
        setMembers((prev) =>
          applyOwnerFlag(
            prev.map((member) => {
              if (member.id !== updatedMember.id) return member;
              const updatedUserId = updatedMember.user?.id ?? member.userId;
              return {
                ...member,
                userId: updatedUserId,
                name: updatedMember.user?.name ?? member.name,
                email: updatedMember.user?.email ?? member.email,
                role: updatedMember.role ?? member.role,
                status: updatedMember.status ?? member.status,
                createdAt: updatedMember.createdAt ?? member.createdAt,
                lastActiveAt: updatedMember.lastActiveAt ?? member.lastActiveAt,
              };
            }),
            ownerId ?? null
          )
        );
      } else if (ownerId !== orgOwnerId) {
        setMembers((prev) => applyOwnerFlag(prev, ownerId ?? null));
      }

      closeMemberModal();
    } catch (error) {
      console.error(error);
      setMemberActionError((error as Error)?.message ?? "Unable to update member role");
    } finally {
      setIsSavingMember(false);
    }
  };

  const openEditModal = () => {
    setForm(initialData);
    setSaveError("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setSaveError("");
    setForm(initialData);
    setIsEditOpen(false);
  };

  const resetForm = () => {
    setForm(initialData);
    setSaveError("");
  };

  const seatsUsed = members.length;

  const cvHistory: BarData[] = [
    { label: "Jan", value: 280 },
    { label: "Feb", value: 320 },
    { label: "Mar", value: 410 },
    { label: "Apr", value: 390 },
    { label: "May", value: 440 },
  ];

  const creditHistory = [1180, 1230, 1200, 1260, 1240, 1275];
  const cvSparkline = creditHistory;

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

  const company = initialData;
  const companyLogo = resolveLogo(company.logo);

  return (
    <div className="space-y-8 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#fef8ff] via-[#f5f6ff] to-white p-6 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-primary-100/60 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-36 w-36 rounded-full bg-[#e5e9ff] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-card-soft">
              <Image
                src={companyLogo}
                alt={`${company.name || "Company"} logo`}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44]">{displayValue(company.name)}</h1>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              onClick={openEditModal}
              leftIcon={<PencilLine className="h-4 w-4" />}
              disabled={loading}
            >
              Edit company
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#EEF2F7] bg-white/90 px-4 py-3 text-sm text-[#4b5563] shadow-card-soft">
          <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          <span>Loading company record…</span>
        </div>
      ) : null}

      {saveMessage ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">{saveMessage}</span>
        </div>
      ) : null}
      {loadError ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-semibold">{loadError}</span>
        </div>
      ) : null}
      {saveError && !isEditOpen ? (
        <div className="flex items-center gap-2 rounded-xl border border-danger-100 bg-danger-50/70 px-4 py-3 text-danger-700 shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-semibold">{saveError}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Current plan"
          value={planSnapshot.name}
          helper={planSnapshot.renewal}
          icon={Sparkles}
          accent="indigo"
          footer={<span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-primary-700">AI-ready</span>}
        />
        <MetricCard
          title="Total users"
          value={`${seatsUsed} / ${planSnapshot.seatLimit}`}
          helper="Active members in this workspace"
          icon={Users2}
          accent="primary"
          footer={<ProgressMeter value={seatsUsed} limit={planSnapshot.seatLimit} label="Seat usage" />}
        />
        <MetricCard
          title="Current balance"
          value={`${formatNumber(planSnapshot.creditBalance)} ${planSnapshot.currency}`}
          helper="Credits available for sorting and exports"
          icon={Wallet}
          accent="emerald"
          footer={
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              +3.8% vs last week
            </div>
          }
        />
        <MetricCard
          title="CVs sorted"
          value={formatNumber(planSnapshot.cvSortedTotal)}
          helper={`${formatNumber(planSnapshot.cvSortedThisMonth)} this month · target ${formatNumber(planSnapshot.cvSortedTarget)}`}
          icon={BarChart3}
          accent="amber"
          footer={<ProgressMeter value={planSnapshot.cvSortedThisMonth} limit={planSnapshot.cvSortedTarget} label="Monthly progress" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">CV sorting trend</p>
              <p className="text-xs text-[#6b7280]">Recent activity by month (dummy data)</p>
            </div>
            <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#4b5563]">Updated just now</span>
          </div>
          <MiniBarChart data={cvHistory} accent="#3D64FF" />
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-xs text-[#4b5563]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1f2a44]">
              <Activity className="h-4 w-4 text-primary-600" />
              Volume is trending upward; keep uploads flowing to hit targets.
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Balance & usage</p>
              <p className="text-xs text-[#6b7280]">Credits remaining vs recent usage</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {formatNumber(planSnapshot.creditBalance)} credits
            </span>
          </div>
          <Sparkline data={cvSparkline} color="#10b981" />
          <div className="space-y-3 rounded-2xl bg-[#f8fafc] p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[#1f2a44]">
              <span>Average weekly spend</span>
              <span>~210 credits</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#4b5563]">
              <span>Last top-up</span>
              <span>12 days ago</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#4b5563]">
              <span>Projected runway</span>
              <span>~3.5 weeks</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <DetailCard
            title="Identity & brand"
            helper="Name, domain, and what teammates see."
            icon={Building2}
            items={[
              { label: "Company name", value: company.name, span: true },
              { label: "Website", value: company.website, isLink: true },
              { label: "Primary domain", value: company.domain },
              { label: "Industry", value: company.industry },
              { label: "Company size", value: company.size },
              { label: "About the company", value: company.description, span: true, helper: "Shown in teammate context and notification footers." },
            ]}
          />
          <DetailCard
            title="Locations"
            helper="Primary office and hiring region."
            icon={Globe2}
            items={[
              { label: "HQ location", value: company.hqLocation },
              { label: "Operating region", value: company.region, helper: "Used for time zone defaults." },
            ]}
          />
        </div>

        <div className="space-y-6">
          <DetailCard
            title="Billing & contacts"
            helper="Where invoices and alerts are sent."
            icon={Mail}
            items={[
              { label: "Billing email", value: company.billingEmail },
              { label: "Phone", value: company.phone },
            ]}
          />

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1f2a44]">Compliance & support</p>
                <p className="text-xs text-[#6b7280]">
                  Keep org details current to speed up support, billing, and audits. You can share your workspace ID with
                  support for change logs.
                </p>
                <p className="text-xs font-semibold text-primary-600">
                  Looking to update something else? Use the editor to request a change.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary-500" />
            </div>
          </div>
        </div>
      </div>

      <CompanyEditModal
        open={isEditOpen}
        onClose={closeEditModal}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
        isSaving={isSaving}
        loading={loading}
        saveError={saveError}
      />

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ff] text-[#3D64FF]">
              <Users2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1f2a44]">Company Members</p>
              <p className="text-xs text-[#6b7280]">Workspace teammates, roles, and status.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              href={canInviteMore ? "/company/invite" : undefined}
              variant="secondary"
              size="sm"
              disabled={!canInviteMore || membersLoading}
            >
              Invite members
            </Button>
            {membersLoading ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                Syncing members…
              </div>
            ) : null}
          </div>
        </div>

        {membersError ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">{membersError}</span>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#EEF2F7] bg-white">
          <table className="min-w-full divide-y divide-[#EEF2F7] text-sm">
            <thead className="bg-[#f8fafc] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8a90a6]">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#1f2a44]">
              {membersLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse bg-white/60">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 rounded-full bg-[#eef2f7]" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 rounded-full bg-[#eef2f7]" />
                            <div className="h-3 w-16 rounded-full bg-[#eef2f7]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-20 rounded-full bg-[#eef2f7]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-16 rounded-full bg-[#eef2f7]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-20 rounded-full bg-[#eef2f7]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-20 rounded-full bg-[#eef2f7]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-16 rounded-full bg-[#eef2f7]" />
                      </td>
                    </tr>
                  ))
                : null}

              {!membersLoading && members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No members found for this workspace yet.
                  </td>
                </tr>
              ) : null}

              {!membersLoading &&
                members.map((member) => (
                  <tr key={member.id} className="bg-white/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#e6dff5] bg-transparent text-sm font-semibold text-primary-700">
                          <Image
                            src={resolveAvatar(member.image)}
                            alt={`${member.name ?? "Member"} avatar`}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-[#1f2a44]">{member.name ?? "Unknown user"}</p>
                          <p className="text-xs text-[#6b7280]">{member.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                        {formatRole(member.role, member.isOwner)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          member.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : member.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-[#f5f7fb] text-[#6b7280]",
                        ].join(" ")}
                      >
                        {formatStatus(member.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1f2a44]">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-[#1f2a44]">{formatDate(member.lastActiveAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => openMemberModal(member.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <MemberDetailsModal
        open={Boolean(selectedMember)}
        member={selectedMember}
        onClose={closeMemberModal}
        selectedRole={selectedRole || selectedMember?.role || ""}
        onRoleChange={setSelectedRole}
        onSave={handleMemberRoleSave}
        isSaving={isSavingMember}
        error={memberActionError || undefined}
        canEditRole={canEditSelectedMemberRole}
        restrictionNote={roleRestrictionNote}
        roleOptions={roleOptions}
      />
    </div>
  );
}
