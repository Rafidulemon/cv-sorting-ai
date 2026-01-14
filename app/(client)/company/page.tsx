"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle2,
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
} from "lucide-react";
import Button from "@/app/components/buttons/Button";
import DetailCard from "@/app/components/company/DetailCard";
import MemberDetailsModal from "@/app/components/company/MemberDetailsModal";
import MetricCard from "@/app/components/company/MetricCard";
import MiniBarChart from "@/app/components/company/MiniBarChart";
import ProgressMeter from "@/app/components/company/ProgressMeter";
import CompanyMembersSection from "@/app/components/company/CompanyMembersSection";
import ClientLayoutLoading from "@/app/components/loading/ClientLayoutLoading";
import { CompanyEditModal } from "@/app/components/modals/CompanyEditModal";
import type {
  CompanyBarData,
  CompanyForm,
  CompanyMember,
  CompanyPlanSnapshot,
  CompanyRoleOption,
} from "@/app/types/company";

const defaultLogo = "/logo/carriastic_logo.png";
const defaultAvatar = "/images/default_dp.png";
const logoBaseUrl = (process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

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

const emptyPlanSnapshot: CompanyPlanSnapshot = {
  name: "",
  renewal: "",
  seatLimit: 0,
  creditBalance: 0,
  currency: "credits",
  cvSortedTotal: 0,
  cvSortedThisMonth: 0,
  cvSortedTarget: 0,
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

const resolveLogo = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return defaultLogo;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  const normalized = trimmed.replace(/^\/+/, "");
  return logoBaseUrl ? `${logoBaseUrl}/${normalized}` : `/${normalized}`;
};

const resolveAvatar = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return defaultAvatar;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  const normalized = trimmed.replace(/^\/+/, "");
  const normalizedStorage = normalized.replace(/^uploads\/profile-avatars\//, "uploads/profile-picture/");
  if (normalizedStorage.startsWith("uploads/")) {
    if (logoBaseUrl) return `${logoBaseUrl}/${normalizedStorage}`;
    return `/${normalizedStorage}`;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return logoBaseUrl ? `${logoBaseUrl}/${normalizedStorage}` : `/${normalizedStorage}`;
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

export default function CompanyPage() {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { id?: string; role?: string; organizationId?: string } | undefined;
  const role = sessionUser?.role;
  const userId = sessionUser?.id ?? null;
  const isMountedRef = useRef(true);
  const [form, setForm] = useState<CompanyForm | null>(null);
  const [initialData, setInitialData] = useState<CompanyForm | null>(null);
  const [orgOwnerId, setOrgOwnerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [memberActionError, setMemberActionError] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [companyLogoSrc, setCompanyLogoSrc] = useState(() => resolveLogo(null));
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(() => resolveLogo(null));
  const [planSnapshot, setPlanSnapshot] = useState<CompanyPlanSnapshot>(emptyPlanSnapshot);

  const isCompanyAdmin = role === "COMPANY_ADMIN";

  const mapOrgToForm = (
    payload: Partial<CompanyForm> & { logoKey?: string | null; logoUrl?: string | null },
  ): CompanyForm => ({
    name: payload.name ?? "",
    website: payload.website ?? "",
    logo: payload.logoUrl ?? payload.logoKey ?? payload.logo ?? defaultLogo,
    domain: payload.domain ?? "",
    industry: payload.industry ?? "",
    size: payload.size ?? "",
    region: payload.region ?? "",
    hqLocation: payload.hqLocation ?? "",
    companyEmail: payload.companyEmail ?? payload.billingEmail ?? "",
    billingEmail: payload.billingEmail ?? "",
    phone: payload.phone ?? "",
    description: payload.description ?? "",
  });

  const handleChange =
    (key: keyof CompanyForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: event.target.value } : prev));
    };

  useEffect(() => {
    if (!initialData) return;
    setLogoPreview(resolveLogo(initialData.logo));
    setCompanyLogoSrc(resolveLogo(initialData.logo));
  }, [initialData]);

  const handleLogoSelect = (file: File) => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setPendingLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const loadCompany = useCallback(async () => {
    if (status === "loading") return;
    setLoading(true);
    setLoadError("");
    setPendingLogoFile(null);
    try {
      const response = await fetch("/api/company");
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
            setLoadError("Unable to access company details.");
            return;
        }
        throw new Error(payload?.error ?? "Unable to load company");
      }
      const company = mapOrgToForm(payload?.organization ?? {});
      if (isMountedRef.current) {
        setForm(company);
        setInitialData(company);
        setLogoPreview(resolveLogo(company.logo));
        setCompanyLogoSrc(resolveLogo(company.logo));
        setSavedAt(null);
        const planFromPayload = payload?.organization?.plan as { name?: string; slug?: string; team?: string | number } | undefined;
        const planName =
          (planFromPayload?.name && planFromPayload.name.trim()) ||
          (planFromPayload?.slug && planFromPayload.slug.trim()) ||
          "";
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
        setLoadError("");
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setLoadError("Unable to load company details right now. Please try again in a moment.");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [status]);

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
            user?: {
              id?: string | null;
              name?: string | null;
              email?: string | null;
              image?: string | null;
              imageUrl?: string | null;
            } | null;
            role?: string;
            status?: string;
            createdAt?: string;
            lastActiveAt?: string;
          };
          const membersPayload: MemberPayload[] = Array.isArray(payload?.members) ? payload.members : [];
          const ownerId = typeof payload?.ownerId === "string" ? payload.ownerId : null;
          const pendingInvites =
            typeof payload?.pendingInviteCount === "number" ? payload.pendingInviteCount : 0;

          const mapped = membersPayload.map((member, index) => ({
            id: member.id ?? `member-${index}`,
            userId: member.user?.id ?? `user-${index}`,
            name: member.user?.name ?? "Unknown",
            email: member.user?.email ?? "—",
            image: member.user?.imageUrl ?? member.user?.image ?? null,
            role: member.role ?? "",
            status: member.status ?? "",
            createdAt: member.createdAt,
            lastActiveAt: member.lastActiveAt,
            isOwner: ownerId ? member.user?.id === ownerId : false,
          }));
          setMembers(mapped);
          setOrgOwnerId(ownerId);
          setPendingInviteCount(pendingInvites);
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
    if (!form) {
      setSaveError("Company data is still loading.");
      return;
    }
    setIsSaving(true);
    setSavedAt(null);
    setSaveError("");

    try {
      let logoToSave = form.logo;
      if (pendingLogoFile) {
        const formData = new FormData();
        formData.append("file", pendingLogoFile);
        formData.append("fileName", pendingLogoFile.name);
        formData.append("contentType", pendingLogoFile.type);

        const uploadResponse = await fetch("/api/jobs/upload-url?purpose=company-logo", {
          method: "POST",
          body: formData,
        });
        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadPayload?.error ?? "Unable to upload logo right now.");
        }
        logoToSave = uploadPayload?.key ?? uploadPayload?.publicUrl ?? logoToSave;
      }

      const response = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logo: logoToSave }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error ?? "Unable to save company";
        setSaveError(message);
        setIsSaving(false);
        return;
      }
      const company = mapOrgToForm(payload?.organization ?? form);
      setForm(company);
      setInitialData(company);
      setPendingLogoFile(null);
      setLogoPreview(resolveLogo(company.logo));
      setCompanyLogoSrc(resolveLogo(company.logo));
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

  const roleOptions = useMemo<CompanyRoleOption[]>(
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

  const applyOwnerFlag = (list: CompanyMember[], owner: string | null) =>
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
    if (!initialData) return;
    setForm(initialData);
    setSaveError("");
    setPendingLogoFile(null);
    setLogoPreview(resolveLogo(initialData.logo));
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (!initialData) return;
    setSaveError("");
    setForm(initialData);
    setPendingLogoFile(null);
    setLogoPreview(resolveLogo(initialData.logo));
    setIsEditOpen(false);
  };

  const resetForm = () => {
    if (!initialData) return;
    setForm(initialData);
    setPendingLogoFile(null);
    setLogoPreview(resolveLogo(initialData.logo));
    setSaveError("");
  };

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const seatsUsed = members.length + pendingInviteCount;
  const seatLimit = planSnapshot.seatLimit ?? 0;
  const seatsRemaining = Math.max(seatLimit - seatsUsed, 0);
  const canInviteMore = seatLimit > 0 && seatsRemaining > 0;

  const cvHistory: CompanyBarData[] = [
    { label: "Jan", value: 280 },
    { label: "Feb", value: 320 },
    { label: "Mar", value: 410 },
    { label: "Apr", value: 390 },
    { label: "May", value: 440 },
  ];

  const creditHistory = [1180, 1230, 1200, 1260, 1240, 1275];
  const cvSparkline = creditHistory;

  useEffect(() => {
    if (!initialData) return;
    setCompanyLogoSrc(resolveLogo(initialData.logo));
  }, [initialData]);

  const globalLoading = (
    <div className="fixed inset-0 z-50">
      <ClientLayoutLoading />
    </div>
  );

  if (status === "loading") {
    return globalLoading;
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

  if (!initialData) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-card-soft backdrop-blur">
          <div className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-semibold">{loadError}</span>
          </div>
        </div>
      );
    }

    return globalLoading;
  }

  const company = initialData;

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
                src={companyLogoSrc}
                alt={`${company.name || "Company"} logo`}
                fill
                sizes="64px"
                className="object-contain p-2"
                onError={() => setCompanyLogoSrc(defaultLogo)}
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
              disabled={loading || !initialData}
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
          value={`${seatsUsed} / ${seatLimit > 0 ? seatLimit : "—"}`}
          helper="Active members in this workspace"
          icon={Users2}
          accent="primary"
          footer={<ProgressMeter value={seatsUsed} limit={seatLimit} label="Seat usage" />}
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
              { label: "Company email", value: company.companyEmail, helper: "Official workspace contact." },
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

      {initialData && form ? (
        <CompanyEditModal
          open={isEditOpen}
          onClose={closeEditModal}
          form={form}
          onChange={handleChange}
          onLogoSelect={handleLogoSelect}
          onSubmit={handleSubmit}
          onReset={resetForm}
          isSaving={isSaving}
          loading={loading}
          saveError={saveError}
          logoPreview={logoPreview}
          isLogoPending={Boolean(pendingLogoFile)}
        />
      ) : null}

      <CompanyMembersSection
        members={members}
        membersLoading={membersLoading}
        membersError={membersError || undefined}
        canInviteMore={canInviteMore}
        seatsRemaining={seatsRemaining}
        seatLimit={seatLimit}
        defaultAvatar={defaultAvatar}
        resolveAvatar={resolveAvatar}
        formatRole={formatRole}
        formatStatus={formatStatus}
        formatDate={formatDate}
        onViewMember={openMemberModal}
      />

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
        resolveAvatar={resolveAvatar}
        formatRole={formatRole}
        formatStatus={formatStatus}
        formatDate={formatDate}
        defaultAvatar={defaultAvatar}
      />
    </div>
  );
}
