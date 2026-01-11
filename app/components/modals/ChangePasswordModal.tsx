"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Button from "@/app/components/buttons/Button";
import TextInput from "@/app/components/inputs/TextInput";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setError("");
    setSuccess("");
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.trim().length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = { newPassword: newPassword.trim() };
      if (currentPassword.trim().length) {
        payload.currentPassword = currentPassword.trim();
      }

      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        const message = data?.error ?? response.statusText ?? "Unable to update password";
        throw new Error(message);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (error) {
      setError((error as Error)?.message ?? "Unable to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      className={`fixed inset-0 z-50 bg-[#0f172a]/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative mx-auto mt-10 w-[min(560px,calc(100%-2rem))] max-h-[90vh] transform transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.28)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F7] bg-gradient-to-r from-[#f5f6ff] via-white to-[#fff4f8] px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Security</p>
              <h2 id="change-password-title" className="text-lg font-semibold text-[#0f172a]">
                Change password
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full !px-3 !py-1.5 text-[#6b7280]">
              Close
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <TextInput
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              helperText="Required if you already have a password set."
              autoComplete="current-password"
            />
            <TextInput
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              isRequired
              autoComplete="new-password"
            />
            <TextInput
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              isRequired
              autoComplete="new-password"
            />

            {error ? (
              <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Update password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
