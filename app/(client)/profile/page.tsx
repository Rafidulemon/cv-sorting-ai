"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Button from "@/app/components/buttons/Button";
import ChangePasswordModal from "@/app/components/modals/ChangePasswordModal";
import TextInput from "@/app/components/inputs/TextInput";
import ClientLayoutLoading from "@/app/components/loading/ClientLayoutLoading";
import {
  Bell,
  CheckCircle2,
  Globe2,
  Mail,
  PencilLine,
  Phone,
  Sparkles,
  Lock,
  X,
  UploadCloud,
} from "lucide-react";

const defaultAvatar = "/images/default_dp.png";
const avatarBaseUrl = (process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

const resolveAvatar = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return defaultAvatar;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  const normalized = trimmed.replace(/^\/+/, "");
  const normalizedStorage = normalized.replace(/^uploads\/profile-avatars\//, "uploads/profile-picture/");
  if (normalizedStorage.startsWith("uploads/")) {
    if (avatarBaseUrl) return `${avatarBaseUrl}/${normalizedStorage}`;
    return `/${normalizedStorage}`;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return avatarBaseUrl ? `${avatarBaseUrl}/${normalizedStorage}` : `/${normalizedStorage}`;
};

type Profile = {
  name: string;
  designation: string;
  team: string;
  email: string;
  phone: string;
  timezone: string;
  status: string;
  lastActive: string;
  startDate: string;
  image: string;
};

type JobActivity = {
  title: string;
  status: "Live" | "Draft" | "Reviewing" | "Completed" | "Archived";
  cvSorted: number;
  analyzed: number;
  updated: string;
};

type ApiJobPayload = {
  title?: string | null;
  status?: string | null;
  cvSortedCount?: number | null;
  cvAnalyzedCount?: number | null;
  lastActivityAt?: string | null;
};

const cvTrend = [14, 22, 19, 28, 25, 31, 27];

const formatNumber = (value: number) => value.toLocaleString();
const formatDateLabel = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatStatusLabel = (value?: string | null) => {
  if (!value) return "—";
  const normalized = value.toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "pending") return "Pending";
  if (normalized === "disabled") return "Disabled";
  return value;
};

const mapJobStatus = (status?: string | null): JobActivity["status"] => {
  switch (status) {
    case "ACTIVE":
      return "Live";
    case "DRAFT":
      return "Draft";
    case "REVIEWING":
      return "Reviewing";
    case "COMPLETED":
      return "Completed";
    case "ARCHIVED":
      return "Archived";
    default:
      return "Draft";
  }
};

function Sparkline({ data, color = "#3D64FF" }: { data: number[]; color?: string }) {
  const sanitized = data.length ? data : [0];
  const max = Math.max(...sanitized, 1);
  const min = Math.min(...sanitized, 0);
  const height = 40;
  const width = 160;
  const range = Math.max(max - min, 1);
  const step = sanitized.length > 1 ? width / (sanitized.length - 1) : 0;
  const points = sanitized
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full">
      <polyline fill="none" stroke="#E5E7EB" strokeWidth="2" points={`0,${height - 6} ${width},${height - 6}`} />
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  draft: Profile;
  onChange: (key: keyof Profile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  error?: string;
  avatarDisplay: string;
};

function EditProfileModal({
  open,
  onClose,
  draft,
  onChange,
  onImageChange,
  onSubmit,
  isSaving,
  error,
  avatarDisplay,
}: EditProfileModalProps) {
  const [avatarPreview, setAvatarPreview] = useState(() => resolveAvatar(avatarDisplay || draft.image));
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
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
    setAvatarPreview(resolveAvatar(avatarDisplay || draft.image));
  }, [draft.image, avatarDisplay]);

  useEffect(() => {
    if (!open) {
      setAvatarError("");
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file (PNG, JPG, WebP, or SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Avatar must be 5MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("contentType", file.type);

    setAvatarUploading(true);
    try {
      const response = await fetch("/api/jobs/upload-url?purpose=profile-avatar", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to upload avatar right now.");
      }
      const key = payload?.key ?? "";
      const publicUrl = payload?.publicUrl ?? "";
      const newImage = key || publicUrl;
      if (newImage) {
        onImageChange(newImage);
        setAvatarPreview(resolveAvatar(publicUrl || newImage));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      console.error(uploadError);
      setAvatarError((uploadError as Error)?.message ?? "Unable to upload avatar right now.");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className={`fixed inset-0 z-50 bg-[#0f172a]/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative mx-auto mt-8 w-[min(960px,calc(100%-2rem))] max-h-[90vh] transform transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] bg-gradient-to-r from-[#f5f6ff] via-white to-[#fff4f8] px-6 py-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                <Sparkles className="h-4 w-4" />
                Profile controls
              </div>
              <div>
                <h2 id="edit-profile-title" className="text-xl font-semibold text-[#0f172a]">
                  Edit profile
                </h2>
                <p className="text-sm text-[#4b5563]">Refresh personal details teammates see across the workspace.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close edit profile modal"
              className="rounded-full !px-2 !py-2 text-[#6b7280] hover:bg-[#f2f4f7] hover:text-[#0f172a]"
              leftIcon={<X className="h-4 w-4" />}
            >
              Close
            </Button>
          </div>

          <form onSubmit={onSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                    <Image
                      src={avatarPreview}
                      alt="Profile avatar preview"
                      fill
                      sizes="64px"
                      className="object-cover"
                      onError={() => setAvatarPreview(defaultAvatar)}
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#0f172a]">Profile photo</p>
                    <p className="text-xs text-[#4b5563]">Used across your workspace and invites. Saved when you click “Save profile”.</p>
                    {avatarError ? <p className="text-xs font-semibold text-danger-600">{avatarError}</p> : null}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<UploadCloud className="h-4 w-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading || isSaving}
                  >
                    {avatarUploading ? "Uploading…" : "Upload photo"}
                  </Button>
                  <p className="text-[11px] text-[#6b7280]">PNG, JPG, WebP, SVG · Max 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Full name" value={draft.name} onChange={onChange("name")} isRequired />
              <TextInput label="Designation" value={draft.designation} onChange={onChange("designation")} />
              <TextInput label="Team" value={draft.team} onChange={onChange("team")} />
              <TextInput label="Timezone" value={draft.timezone} onChange={onChange("timezone")} />
              <TextInput label="Phone" value={draft.phone} onChange={onChange("phone")} type="tel" />
            </div>

            {error ? (
              <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving || avatarUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || avatarUploading}>
                {isSaving ? "Saving…" : avatarUploading ? "Uploading…" : "Save profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile>(() => ({
    name: session?.user?.name ?? "",
    designation: "",
    team: "",
    email: session?.user?.email ?? "",
    phone: "",
    timezone: "",
    status: "",
    lastActive: "",
    startDate: "",
    image: session?.user?.image ?? "",
  }));
  const [draftProfile, setDraftProfile] = useState<Profile>(profile);
  const [profileAvatarSrc, setProfileAvatarSrc] = useState(resolveAvatar(profile.image));
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [jobs, setJobs] = useState<JobActivity[]>([]);
  const [jobStats, setJobStats] = useState({ jobsCreated: 0, liveJobs: 0, totalSorted: 0, totalAnalyzed: 0 });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: session?.user?.name ?? prev.name,
      email: session?.user?.email ?? prev.email,
      image:
        session?.user?.image && session.user.image.trim().length
          ? session.user.image
          : prev.image,
    }));
  }, [session]);

  useEffect(() => {
    setProfileAvatarSrc(resolveAvatar(profile.image));
  }, [profile.image]);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : {};
      if (!response.ok) {
        const message = payload?.error ?? response.statusText ?? "Failed to load profile";
        setProfileError(message);
        setJobs([]);
        setJobStats({ jobsCreated: 0, liveJobs: 0, totalSorted: 0, totalAnalyzed: 0 });
        return;
      }
      const user = payload.user as Partial<Profile & { profileStatus?: string; startedAt?: string }>;
      const imageUrl = typeof payload?.imageUrl === "string" ? payload.imageUrl : undefined;
      const imageKey = user.image ?? "";
      const imageForDisplay = imageUrl ?? imageKey;
      setProfile((prev) => {
        const next = {
          ...prev,
          name: user.name ?? prev.name,
          designation: user.designation ?? prev.designation,
          team: user.team ?? prev.team,
          email: user.email ?? prev.email,
          phone: user.phone ?? prev.phone,
          timezone: user.timezone ?? prev.timezone,
          status: user.profileStatus ?? prev.status,
          startDate: user.startedAt ? formatDateLabel(user.startedAt) : prev.startDate,
          image: imageKey || prev.image,
          lastActive: payload?.membership?.lastActiveAt
            ? `Active · ${formatDateLabel(payload.membership.lastActiveAt)}`
            : prev.lastActive,
        };
        setProfileAvatarSrc(resolveAvatar(imageForDisplay || next.image));
        return next;
      });

      const apiJobs: ApiJobPayload[] = Array.isArray(payload?.jobs) ? payload.jobs : [];
      setJobs(
        apiJobs.map((job) => ({
          title: job.title ?? "Untitled",
          status: mapJobStatus(job.status),
          cvSorted: Number(job.cvSortedCount) || 0,
          analyzed: Number(job.cvAnalyzedCount) || 0,
          updated: job.lastActivityAt ? `${formatDateLabel(job.lastActivityAt)}` : "Recently",
        }))
      );

      if (payload?.stats) {
        setJobStats({
          jobsCreated: payload.stats.jobsCreated ?? apiJobs.length,
          liveJobs: payload.stats.liveJobs ?? 0,
          totalSorted: payload.stats.totalSorted ?? 0,
          totalAnalyzed: payload.stats.totalAnalyzed ?? 0,
        });
      } else {
        const totalSortedFromJobs = apiJobs.reduce((total, job) => total + (job.cvSortedCount ?? 0), 0);
        const totalAnalyzedFromJobs = apiJobs.reduce((total, job) => total + (job.cvAnalyzedCount ?? 0), 0);
        const liveJobsFromJobs = apiJobs.filter((job) => job.status === "ACTIVE").length;
        setJobStats({
          jobsCreated: apiJobs.length,
          liveJobs: liveJobsFromJobs,
          totalSorted: totalSortedFromJobs,
          totalAnalyzed: totalAnalyzedFromJobs,
        });
      }
    } catch (error) {
      console.error(error);
      setProfileError((error as Error)?.message ?? "Failed to load profile");
      setJobs([]);
      setJobStats({ jobsCreated: 0, liveJobs: 0, totalSorted: 0, totalAnalyzed: 0 });
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const personalDetails = [
    { label: "Full name", value: profile.name },
    { label: "Designation", value: profile.designation },
    { label: "Team", value: profile.team },
  ];

  const contactDetails = [
    { label: "Work email", value: profile.email, icon: Mail },
    { label: "Phone", value: profile.phone, icon: Phone },
    { label: "Timezone", value: profile.timezone, icon: Globe2 },
  ];

  const statusDetails = [
    { label: "Status", value: formatStatusLabel(profile.status) },
    { label: "Member since", value: profile.startDate || "—" },
    { label: "Last active", value: profile.lastActive || "—" },
  ];

  const openEditModal = () => {
    setSaveError("");
    setDraftProfile(profile);
    setIsEditOpen(true);
  };

  const openPasswordModal = () => setIsPasswordOpen(true);

  const closeEditModal = () => {
    setSaveError("");
    setIsEditOpen(false);
  };

  const closePasswordModal = () => setIsPasswordOpen(false);

  const handleDraftChange =
    (key: keyof Profile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraftProfile((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleAvatarChange = (value: string) => {
    setDraftProfile((prev) => ({ ...prev, image: value }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError("");
    setSavingProfile(true);

    const payload = {
      name: draftProfile.name.trim(),
      designation: draftProfile.designation.trim(),
      team: draftProfile.team.trim(),
      phone: draftProfile.phone.trim(),
      timezone: draftProfile.timezone.trim(),
      image: draftProfile.image.trim(),
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) {
        const message = data?.error ?? response.statusText ?? "Unable to save profile";
        throw new Error(message);
      }

      const user = data.user as Partial<Profile & { profileStatus?: string; startedAt?: string; imageUrl?: string }>;
      const imageUrl = typeof data?.imageUrl === "string" ? data.imageUrl : user?.imageUrl;
      const imageKey = user?.image ?? payload.image ?? profile.image;
      const imageForDisplay = imageUrl ?? imageKey;

      const nextProfile: Profile = {
        ...profile,
        name: user?.name ?? payload.name ?? profile.name,
        designation: user?.designation ?? payload.designation ?? profile.designation,
        team: user?.team ?? payload.team ?? profile.team,
        email: user?.email ?? profile.email,
        phone: user?.phone ?? payload.phone ?? profile.phone,
        timezone: user?.timezone ?? payload.timezone ?? profile.timezone,
        status: user?.profileStatus ?? profile.status,
        startDate: user?.startedAt ? formatDateLabel(user.startedAt) : profile.startDate,
        image: imageKey,
        lastActive: profile.lastActive,
      };

      setProfile(nextProfile);
      setProfileAvatarSrc(resolveAvatar(imageForDisplay || nextProfile.image));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profile:updated", { detail: { image: imageKey } }));
      }

      setDraftProfile((prev) => ({
        ...prev,
        name: user?.name ?? payload.name ?? prev.name,
        designation: user?.designation ?? payload.designation ?? prev.designation,
        team: user?.team ?? payload.team ?? prev.team,
        phone: user?.phone ?? payload.phone ?? prev.phone,
        timezone: user?.timezone ?? payload.timezone ?? prev.timezone,
        image: imageKey ?? prev.image,
      }));

      setProfileError("");
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      setSaveError((error as Error)?.message ?? "Unable to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const globalLoading = (
    <div>
      <ClientLayoutLoading />
    </div>
  );

  if (loadingProfile) {
    return globalLoading;
  }

  return (
    <div className="space-y-10 text-[#0f172a]">
      <section className="relative overflow-hidden rounded-4xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#f7f9ff] to-white p-6 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-6 h-36 w-36 rounded-full bg-primary-100/70 blur-3xl" />
          <div className="absolute right-6 bottom-4 h-32 w-32 rounded-full bg-[#fde9f5] blur-3xl" />
        </div>
        <div className="relative grid gap-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.12)] lg:h-20 lg:w-20">
                  <Image
                    src={profileAvatarSrc}
                    alt={`${profile.name} avatar`}
                    fill
                    sizes="120px"
                    className="object-cover"
                    onError={() => setProfileAvatarSrc(defaultAvatar)}
                    unoptimized
                  />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                    <Sparkles className="h-4 w-4" />
                    Profile
                  </span>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-semibold leading-tight lg:text-4xl">{profile.name}</h1>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={openEditModal} leftIcon={<PencilLine className="h-4 w-4" />}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 rounded-4xl border border-[#E5E7EB] bg-white p-7 shadow-card-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">Identity & contact</p>
              <p className="text-xs text-[#4b5563]">Signals shared on scorecards and invites.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={openEditModal} leftIcon={<PencilLine className="h-4 w-4" />}>
              Edit
            </Button>
          </div>
          {profileError ? (
            <div className="rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700">
              {profileError}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {personalDetails.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {contactDetails.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.label}-${item.value}`}
                  className="flex items-start gap-3 rounded-2xl border border-[#EEF2F7] bg-white px-4 py-3 shadow-card-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-primary-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#0f172a]">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {statusDetails.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#EEF2F7] bg-white px-4 py-3 shadow-card-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-[#EEF2F7] bg-white px-4 py-3 shadow-card-soft md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-primary-600">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">Security</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">Change password</p>
                <p className="text-xs text-[#6b7280]">Update your login password to keep your account protected.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={openPasswordModal}>
              Change password
            </Button>
          </div>
          <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] p-4 text-sm text-[#4b5563]">
            <div className="flex items-center gap-2 text-[#0f172a]">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">Profile details kept in sync</span>
            </div>
            <p className="mt-1 text-xs text-[#6b7280]">
              Contact info, team, and role fields update instantly for your workspace.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-4xl border border-[#E5E7EB] bg-white p-7 shadow-card-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Jobs & CV activity</p>
                <p className="text-xs text-[#4b5563]">Snapshot of your jobs and sorting volume.</p>
              </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
                  {jobStats.liveJobs} live
                </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">Jobs created</p>
                <p className="mt-1 text-2xl font-semibold text-[#0f172a]">{jobStats.jobsCreated}</p>
                <p className="text-xs text-[#6b7280]">Across this workspace</p>
              </div>
              <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">CVs sorted</p>
                <p className="mt-1 text-2xl font-semibold text-[#0f172a]">{formatNumber(jobStats.totalSorted)}</p>
                <p className="text-xs text-[#6b7280]">All-time on your jobs</p>
              </div>
              <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">Analyzed deeply</p>
                <p className="mt-1 text-2xl font-semibold text-[#0f172a]">{formatNumber(jobStats.totalAnalyzed)}</p>
                <p className="text-xs text-[#6b7280]">With role-specific signals</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Recent CV throughput</p>
                  <p className="text-xs text-[#6b7280]">Weekly trend across active roles</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
                  +8% vs last week
                </span>
              </div>
              <div className="mt-3">
                <Sparkline data={cvTrend} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-4xl border border-[#E5E7EB] bg-white p-7 shadow-card-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ff] text-primary-600">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Jobs created by you</p>
                  <p className="text-xs text-[#4b5563]">Latest roles with CVs sorted/analyzed.</p>
                </div>
              </div>
              <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b5563]">
                {jobStats.jobsCreated} jobs
              </span>
            </div>
            <div className="space-y-3">
              {jobs.map((job) => {
                const progress = job.cvSorted > 0 ? Math.min(100, Math.round((job.analyzed / job.cvSorted) * 100)) : 0;
                const statusColor =
                  job.status === "Live"
                    ? "bg-emerald-50 text-emerald-700"
                    : job.status === "Reviewing"
                    ? "bg-amber-50 text-amber-700"
                    : job.status === "Completed"
                    ? "bg-primary-50 text-primary-700"
                    : job.status === "Archived"
                    ? "bg-[#f5f7fb] text-[#6b7280]"
                    : "bg-[#f5f7fb] text-[#6b7280]";
                return (
                  <div key={job.title} className="space-y-2 rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{job.title}</p>
                        <p className="text-xs text-[#6b7280]">Updated {job.updated}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusColor}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#0f172a]">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4b5563]">
                        {formatNumber(job.cvSorted)} CVs sorted
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4b5563]">
                        {formatNumber(job.analyzed)} analyzed
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <EditProfileModal
        open={isEditOpen}
        onClose={closeEditModal}
        draft={draftProfile}
        onChange={handleDraftChange}
        onImageChange={handleAvatarChange}
        onSubmit={handleProfileSubmit}
        isSaving={savingProfile}
        error={saveError}
        avatarDisplay={profileAvatarSrc}
      />
      <ChangePasswordModal open={isPasswordOpen} onClose={closePasswordModal} />
    </div>
  );
}
