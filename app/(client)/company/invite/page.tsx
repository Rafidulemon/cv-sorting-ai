"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Mail, Plus, Users } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";
import EmailInput from "@/app/components/inputs/EmailInput";
import SelectBox from "@/app/components/inputs/SelectBox";

export default function InviteMembersPage() {
  const [emails, setEmails] = useState<string[]>([""]);
  const [role, setRole] = useState("COMPANY_MEMBER");
  const [seatLimit, setSeatLimit] = useState<number | null>(null);
  const [seatsRemaining, setSeatsRemaining] = useState<number | null>(null);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadSeatData = async () => {
      setLoadingSeats(true);
      setError("");
      try {
        const [companyRes, membersRes] = await Promise.all([fetch("/api/company"), fetch("/api/company/members")]);

        let seatLimitValue: number | null = null;
        if (companyRes.ok) {
          const payload = await companyRes.json();
          seatLimitValue =
            typeof payload?.organization?.seatLimit === "number" ? payload.organization.seatLimit : null;
        }

        let seatsUsed = 0;
        if (membersRes.ok) {
          const payload = await membersRes.json();
          const membersCount = Array.isArray(payload?.members) ? payload.members.length : 0;
          const pendingInvites = typeof payload?.pendingInviteCount === "number" ? payload.pendingInviteCount : 0;
          seatsUsed = membersCount + pendingInvites;
        }

        setSeatLimit(seatLimitValue);
        setSeatsRemaining(seatLimitValue !== null ? Math.max(seatLimitValue - seatsUsed, 0) : null);
      } catch (err) {
        console.error(err);
        setError("Unable to load seat availability. Invites will still attempt to send.");
        setSeatLimit(null);
        setSeatsRemaining(null);
      } finally {
        setLoadingSeats(false);
      }
    };

    loadSeatData();
  }, []);

  const addRow = () => setEmails((prev) => [...prev, ""]);
  const updateRow = (index: number, value: string) =>
    setEmails((prev) => prev.map((item, i) => (i === index ? value : item)));
  const removeEmpty = () => setEmails((prev) => prev.filter((email) => email.trim().length));

  const sendInvites = async () => {
    const cleaned = emails.map((email) => email.trim()).filter(Boolean);
    if (!cleaned.length) {
      setError("Please add at least one email address.");
      return;
    }

    if (seatsRemaining !== null && cleaned.length > seatsRemaining) {
      setError(`You can invite up to ${seatsRemaining} more teammate(s) based on your plan.`);
      return;
    }

    setError("");
    setSuccess("");
    setIsSending(true);
    try {
      const response = await fetch("/api/company/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: cleaned, role }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to send invitations right now.");
      }

      setSuccess(`Invitations sent to ${cleaned.length} teammate${cleaned.length > 1 ? "s" : ""}.`);
      const remaining = typeof payload?.seatsRemaining === "number" ? payload.seatsRemaining : seatsRemaining;
      setSeatsRemaining(remaining ?? seatsRemaining);
      setEmails([""]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to send invitations right now.");
    } finally {
      setIsSending(false);
    }
  };

  const seatLabel =
    seatLimit !== null && seatsRemaining !== null
      ? `${seatsRemaining} of ${seatLimit} seats remaining`
      : "Seat availability syncing";

  return (
    <div className="space-y-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft text-[#1f2a44]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-semibold leading-tight text-[#1f2a44]">Invite company members</p>
            <p className="text-sm text-[#6b7280]">
              Send invites to teammates. Seat limits from your plan are enforced automatically.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" href="/company">
            Back to company
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
            {loadingSeats ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" /> : <Users className="h-3.5 w-3.5 text-primary-500" />}
            {seatLabel}
          </span>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-[#EEF2F7] bg-white/90 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <SelectBox
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              options={[
                { label: "Company admin", value: "COMPANY_ADMIN" },
                { label: "Member", value: "COMPANY_MEMBER" },
                { label: "Viewer", value: "VIEWER" },
              ]}
            />
            <TextInput
              label="Add a note (optional)"
              placeholder="Welcome aboard — here’s how we use carriX."
              value=""
              onChange={() => {}}
              disabled
            />
          </div>
          <Button type="button" variant="secondary" leftIcon={<Plus className="h-4 w-4" />} onClick={addRow}>
            Add email
          </Button>
        </div>

        <div className="space-y-3">
          {emails.map((email, index) => (
            <EmailInput
              key={`invite-${index}`}
              label={index === 0 ? "Emails" : ""}
              placeholder="teammate@company.com"
              value={email}
              onChange={(event) => updateRow(index, event.target.value)}
              rightIcon={<Mail className="h-4 w-4 text-[#9aa0b5]" />}
            />
          ))}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={removeEmpty} variant="secondary">
            Clean empty rows
          </Button>
          <Button type="button" leftIcon={isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} onClick={sendInvites} disabled={isSending}>
            {isSending ? "Sending…" : "Send invites"}
          </Button>
        </div>
      </div>
    </div>
  );
}
