"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import type { CompanyMember, CompanyRoleOption } from "@/app/types/company";
import Button from "@/app/components/buttons/Button";
import SelectBox from "@/app/components/inputs/SelectBox";

type MemberDetailsModalProps = {
  open: boolean;
  member: CompanyMember | null;
  onClose: () => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  error?: string;
  canEditRole: boolean;
  restrictionNote?: string;
  roleOptions: CompanyRoleOption[];
  resolveAvatar: (value?: string | null) => string;
  formatRole: (value?: string, isOwner?: boolean) => string;
  formatStatus: (value?: string) => string;
  formatDate: (value?: string) => string;
  defaultAvatar: string;
};

export default function MemberDetailsModal({
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
  resolveAvatar,
  formatRole,
  formatStatus,
  formatDate,
  defaultAvatar,
}: MemberDetailsModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === "undefined" || !open) return null;

  const avatarSrc = resolveAvatar(member?.image);
  const avatarAlt = member?.name ?? member?.email ?? "Member avatar";
  const roleLabel = formatRole(member?.role, member?.isOwner);
  const statusLabel = formatStatus(member?.status);
  const saveDisabled = !member || isSaving || selectedRole === member.role || !canEditRole;
  const joined = formatDate(member?.createdAt);
  const lastActive = formatDate(member?.lastActiveAt);
  const memberInitial = (name?: string, fallback?: string) => {
    const source = (name || fallback || "?").trim();
    return source.charAt(0).toUpperCase() || "?";
  };

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
                  onError={(event) => {
                    const target = event?.target as HTMLImageElement | null;
                    if (target) target.src = defaultAvatar;
                  }}
                />
              </div>
              <div>
                <h2 id="member-details-title" className="text-lg font-semibold text-[#1f2a44]">
                  {member?.name ?? "Member details"}
                </h2>
                <p className="text-xs text-[#6b7280]">{member?.email ?? "Select a member to view details"}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Close member details"
              className="rounded-full !px-2 !py-2 text-[#6b7280] hover:bg-[#f2f4f7] hover:text-[#1f2a44]"
              leftIcon={<X className="h-4 w-4" />}
            >
              Close
            </Button>
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
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{joined || "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">Last active</p>
                <p className="mt-1 text-sm font-semibold text-[#1f2a44]">{lastActive || "—"}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#EEF2F7] bg-[#f8fafc] px-4 py-4 shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Update role</p>
                  <p className="text-xs text-[#6b7280]">Changes apply immediately.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSave}
                  disabled={saveDisabled}
                  className="min-w-[120px]"
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <SelectBox
                label="Role"
                value={selectedRole}
                onChange={(event) => onRoleChange(event.target.value)}
                disabled={!member || isSaving || !canEditRole}
                options={roleOptions}
              />
              <p className="text-xs text-[#6b7280]">Owner can only be changed by another owner.</p>
              {restrictionNote ? <p className="text-xs font-semibold text-amber-700">{restrictionNote}</p> : null}
            </div>

            <div className="rounded-2xl border border-white/70 bg-[#f8fafc] px-4 py-3 text-xs text-[#4b5563]">
              <p className="font-semibold text-[#0f172a]">Member ID</p>
              <p className="truncate font-mono text-[#4b5563]">{member?.id ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
