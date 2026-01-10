"use client";

import { useState } from "react";
import { Mail, Plus, Users } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";
import EmailInput from "@/app/components/inputs/EmailInput";
import SelectBox from "@/app/components/inputs/SelectBox";

export default function InviteMembersPage() {
  const [emails, setEmails] = useState<string[]>([""]);
  const [role, setRole] = useState("COMPANY_MEMBER");

  const addRow = () => setEmails((prev) => [...prev, ""]);
  const updateRow = (index: number, value: string) =>
    setEmails((prev) => prev.map((item, i) => (i === index ? value : item)));
  const removeEmpty = () => setEmails((prev) => prev.filter((email) => email.trim().length));

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
              Send invites to teammates. They&apos;ll get email links to join with the selected role.
            </p>
          </div>
        </div>
        <Button variant="secondary" href="/company">
          Back to company
        </Button>
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

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={removeEmpty} variant="secondary">
            Clean empty rows
          </Button>
          <Button type="button" leftIcon={<Mail className="h-4 w-4" />}>
            Send invites
          </Button>
        </div>
      </div>
    </div>
  );
}
