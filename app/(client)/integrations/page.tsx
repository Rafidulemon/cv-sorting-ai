// Client component to enable OAuth redirects and clipboard actions
"use client";
import { ArrowRight, FolderDown, MailCheck, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const gmailScopes = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.metadata",
];

const driveFileTypes = ["PDF", "DOCX", "XLSX/CSV", "Images", "ZIP archives"];

const gmailRedirectUri =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/integrations/google/oauth/callback";
const driveWebhookEndpoint = "https://app.carrix.ai/api/integrations/google-drive/webhook";

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleDriveScopes = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.metadata.readonly"];
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingStatus(true);
      try {
        const res = await fetch("/api/profile", { cache: "no-store", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const email = data?.user?.connectedEmail ?? null;
        setConnectedEmail(email);
        setIsGmailConnected(Boolean(email));
      } catch (error) {
        console.error("Failed to fetch profile for gmail status", error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchProfile();
  }, []);

  const mismatchConnected = searchParams?.get("status") === "email_mismatch" ? searchParams.get("connected") : null;
  const mismatchLogin = searchParams?.get("status") === "email_mismatch" ? searchParams.get("login") : null;

  const handleConnectGmail = useCallback(() => {
    if (!googleClientId) {
      alert("Google Client ID is not configured.");
      return;
    }
    const state = session?.user?.id ? `uid:${session.user.id}` : "no_user";
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: gmailRedirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: gmailScopes.join(" "),
      state,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [googleClientId, session?.user?.id]);

  const handleConnectDrive = useCallback(() => {
    if (!googleClientId) {
      alert("Google Client ID is not configured.");
      return;
    }
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: gmailRedirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: googleDriveScopes.join(" "),
      include_granted_scopes: "true",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [googleClientId]);

  const handleCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied to clipboard");
    } catch (error) {
      console.error("Clipboard copy failed", error);
      alert("Unable to copy. Please copy manually.");
    }
  }, []);

  const handleDisconnectGmail = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/google/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Unable to disconnect Gmail");
      }
      setIsGmailConnected(false);
      setConnectedEmail(null);
      // Refresh profile to ensure UI stays in sync
      try {
        const refreshed = await fetch("/api/profile", { cache: "no-store" });
        if (refreshed.ok) {
          const data = await refreshed.json();
          const email = data?.user?.connectedEmail ?? null;
          setConnectedEmail(email);
          setIsGmailConnected(Boolean(email));
        }
      } catch {
        /* ignore */
      }
      alert("Gmail disconnected.");
    } catch (error: any) {
      alert(error?.message ?? "Failed to disconnect Gmail");
    }
  }, []);

  return (
    <div className="space-y-6 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-[#f7e2f3] blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-[#e2e7ff] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Integrations</p>
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">
              Connect Gmail for sending, Drive for files
            </h1>
            <p className="max-w-2xl text-sm text-[#8a90a6]">
              Send emails from your own Gmail identity and auto-collect CVs from Google Drive into carriX. Everything stays
              synced without manual downloads or SMTP config.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-[#ecfdf3] px-4 py-2 text-xs font-semibold text-[#15803d]">Gmail send</span>
              <span className="rounded-full bg-[#f0f9ff] px-4 py-2 text-xs font-semibold text-[#0369a1]">Drive intake</span>
              <span className="rounded-full bg-[#fff7ed] px-4 py-2 text-xs font-semibold text-[#c2410c]">OAuth & webhooks</span>
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Messaging & files</p>
            <h2 className="text-2xl font-semibold text-[#1f2a44]">Gmail + Google Drive integration</h2>
            <p className="text-sm text-[#8a90a6]">Send outreach from your Gmail identity and ingest candidate files from Drive.</p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm ${
              isGmailConnected
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white/90 text-zinc-600"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${isGmailConnected ? "text-emerald-500" : "text-zinc-400"}`} />
            {isGmailConnected ? "Connected" : "Not connected"}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-[#f4f6ff] via-white to-[#f0fff4] p-5 shadow-sm">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-primary-100/60 blur-3xl" />
            <div className="relative space-y-4">
              {mismatchConnected && mismatchLogin ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  Connected Gmail ({mismatchConnected}) doesn&apos;t match your account email ({mismatchLogin}). Use the same Gmail or sign in with the matching account.
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-primary-500 shadow-sm">
                    <MailCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Email sending</p>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">Gmail (API)</h3>
                    <p className="text-sm text-[#8a90a6]">Use your Gmail identity for sequences, replies, and alerts.</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isGmailConnected
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-white/80 text-zinc-500"
                  }`}
                >
                  {isGmailConnected ? "Connected" : "Not connected"}
                </span>
              </div>

              <div className="rounded-xl border border-white/80 bg-white/80 p-4 shadow-[0_10px_30px_-28px_rgba(31,42,68,0.5)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">Required fields</p>
                <ul className="mt-2 space-y-2 text-sm text-[#1f2a44]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    Google OAuth Client ID & Client Secret
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    Redirect URI <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-xs font-semibold text-[#374151]">{gmailRedirectUri}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    Authorized sender address (the Gmail inbox you own)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    Scopes for send + metadata:
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gmailScopes.map((scope) => (
                    <span
                      key={scope}
                      className="rounded-full bg-[#f0f9ff] px-3 py-1 text-[11px] font-semibold text-[#0ea5e9] ring-1 ring-[#bfdbfe]"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[#15803d]">DMARC aligned</span>
                <span className="rounded-full bg-[#f5f3ff] px-3 py-1 text-[#6d28d9]">Threaded replies</span>
                <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-[#c2410c]">Daily send caps respected</span>
              </div>

              {!loadingStatus && !isGmailConnected ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-primary-200/50"
                    onClick={handleConnectGmail}
                  >
                    Connect Gmail
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {connectedEmail ? `Connected: ${connectedEmail}` : "Connected"}
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#1f2a44] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600"
                    onClick={handleDisconnectGmail}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-[#f0f9ff] via-white to-[#fdf2f8] p-5 shadow-sm">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-[#fde68a]/60 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#f59e0b] shadow-sm">
                    <FolderDown className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">File intake</p>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">Google Drive</h3>
                    <p className="text-sm text-[#8a90a6]">Ingest resumes and documents from a shared folder or drive.</p>
                  </div>
                </div>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  In beta
                </span>
              </div>

              <div className="rounded-xl border border-white/80 bg-white/80 p-4 shadow-[0_10px_30px_-28px_rgba(31,42,68,0.5)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">Required fields</p>
                <ul className="mt-2 space-y-2 text-sm text-[#1f2a44]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Service account email + private key (JSON)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Shared Drive or Folder ID to watch
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Webhook endpoint <span className="rounded-md bg-[#fef3c7] px-2 py-1 text-xs font-semibold text-[#92400e]">{driveWebhookEndpoint}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Verification token + channel ID for push notifications
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Allowed file types:
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {driveFileTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-semibold text-[#c2410c] ring-1 ring-[#fed7aa]"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-[#0369a1]">Virus scan on ingest</span>
                <span className="rounded-full bg-[#fef2f2] px-3 py-1 text-[#b91c1c]">Duplicate guard</span>
                <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[#374151]">5 min polling fallback</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-[#f59e0b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-amber-200/60"
                  onClick={handleConnectDrive}
                >
                  Connect Drive
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#1f2a44] shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:text-amber-700"
                  onClick={() => handleCopy(driveWebhookEndpoint)}
                >
                  Copy webhook URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
