"use client";

import Image from "next/image";
import { AlertTriangle, Eye, Loader2, Users2 } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import type { CompanyMember } from "@/app/types/company";

type CompanyMembersSectionProps = {
  members: CompanyMember[];
  membersLoading: boolean;
  membersError?: string;
  canInviteMore: boolean;
  seatsRemaining: number;
  seatLimit: number;
  defaultAvatar: string;
  resolveAvatar: (value?: string | null) => string;
  formatRole: (value?: string, isOwner?: boolean) => string;
  formatStatus: (value?: string) => string;
  formatDate: (value?: string) => string;
  onViewMember: (memberId: string) => void;
};

export default function CompanyMembersSection({
  members,
  membersLoading,
  membersError,
  canInviteMore,
  seatsRemaining,
  seatLimit,
  defaultAvatar,
  resolveAvatar,
  formatRole,
  formatStatus,
  formatDate,
  onViewMember,
}: CompanyMembersSectionProps) {
  return (
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
            title={seatLimit > 0 ? `${seatsRemaining} seats remaining` : "Seat limit not available yet"}
          >
            Invite members
          </Button>
          {membersLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
              Syncing members…
            </div>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
              <Users2 className="h-3.5 w-3.5 text-primary-500" />
              {seatLimit > 0 ? `${seatsRemaining} seats left` : "Seat limit syncing"}
            </span>
          )}
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
                          onError={(event) => {
                            const target = event?.target as HTMLImageElement | null;
                            if (target) target.src = defaultAvatar;
                          }}
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
                      onClick={() => onViewMember(member.id)}
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
  );
}
