"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type OverlayStatus = "idle" | "uploading" | "processing" | "success" | "error";

type OverlayState = {
  status: OverlayStatus;
  percent: number;
  message: string;
  detail?: string;
  queueJobId?: string;
  expectedFiles?: number;
  uploaded?: number;
  failed?: number;
  timestamp?: number;
  files?: number;
  sourceKey?: string;
};

type UploadOverlayContextValue = {
  state: OverlayState;
  showUpload: (message?: string) => void;
  updateProgress: (percent: number, message?: string) => void;
  trackQueueJob: (queueJobId: string, expectedFiles?: number) => void;
  markSuccess: (message?: string, detail?: string) => void;
  markError: (message?: string, detail?: string) => void;
  hide: () => void;
};

const UploadOverlayContext = createContext<UploadOverlayContextValue | null>(null);
const STORAGE_KEY = "carrix-upload-overlay";

export function UploadOverlayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OverlayState>({
    status: "idle",
    percent: 0,
    message: "",
  });

  const setStateWithTimestamp = (updater: OverlayState | ((prev: OverlayState) => OverlayState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: OverlayState) => OverlayState)(prev) : updater;
      return { ...next, timestamp: Date.now() };
    });
  };

  // Persist overlay state so it survives reloads while an upload/processing job is active.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as OverlayState | null;
      if (!saved || saved.status === "idle") return;
      const stale = saved.timestamp && Date.now() - saved.timestamp > 5 * 60 * 1000; // 5 minutes
      const finishedUpload = (saved.status === "uploading" || saved.status === "processing") && saved.percent >= 99 && !saved.queueJobId;
      if (stale || finishedUpload) {
        window.localStorage.removeItem(STORAGE_KEY);
        setStateWithTimestamp({ status: "idle", percent: 0, message: "" });
        return;
      }
      setState(saved);
    } catch (error) {
      console.warn("Upload overlay restore failed", error);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Upload overlay persist failed", error);
    }
  }, [state]);

  const clearStorage = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Upload overlay clear failed", error);
    }
  };

  const hide = () => {
    setStateWithTimestamp({ status: "idle", percent: 0, message: "" });
    clearStorage();
  };

  const showUpload = (message = "Uploading files") => {
    setStateWithTimestamp((prev) => ({
      ...prev,
      status: "uploading",
      percent: Math.max(prev.percent, 1),
      message,
      files: prev.files,
      sourceKey: prev.sourceKey,
    }));
  };

  const updateProgress = (percent: number, message?: string) => {
    setStateWithTimestamp((prev) => ({
      ...prev,
      status: prev.status === "idle" ? "uploading" : prev.status,
      percent: Math.min(99, Math.max(prev.percent, percent)),
      message: message ?? prev.message,
    }));
  };

  const markSuccess = (message = "Upload complete", detail?: string) => {
    setStateWithTimestamp((prev) => ({
      ...prev,
      status: "success",
      percent: 100,
      message,
      detail,
      queueJobId: undefined,
    }));
  };

  const markError = (message = "Upload failed", detail?: string) => {
    setStateWithTimestamp((prev) => ({
      ...prev,
      status: "error",
      percent: prev.percent || 100,
      message,
      detail,
      queueJobId: undefined,
    }));
  };

  const trackQueueJob = (queueJobId: string, expectedFiles?: number) => {
    if (!queueJobId) return;
    setStateWithTimestamp((prev) => ({
      ...prev,
      queueJobId,
      expectedFiles,
      status: "processing",
      message: "Processing ZIP...",
      percent: Math.max(prev.percent, 35),
    }));
  };

  return (
    <UploadOverlayContext.Provider
      value={{ state, showUpload, updateProgress, trackQueueJob, markSuccess, markError, hide }}
    >
      {children}
      <UploadOverlay />
    </UploadOverlayContext.Provider>
  );
}

export function useUploadOverlay() {
  const ctx = useContext(UploadOverlayContext);
  if (!ctx) throw new Error("useUploadOverlay must be used within UploadOverlayProvider");
  return ctx;
}

function UploadOverlay() {
  const { state, markSuccess, markError, updateProgress, hide } = useUploadOverlay();
  const { queueJobId, expectedFiles } = state;

  useEffect(() => {
    if (!queueJobId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // ~60s with 2s delay
    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/jobs/upload-cv-zip/status?queueJobId=${queueJobId}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch status");
        const payload = await response.json();
        const status = payload?.status as string | undefined;
        const result = payload?.result as { uploaded?: number; failed?: number } | undefined;

        if (result && expectedFiles) {
          const processed = (result.uploaded || 0) + (result.failed || 0);
          const percent = Math.min(98, Math.round((processed / expectedFiles) * 100));
          updateProgress(percent, "Processing ZIP...");
        }

        if (status === "COMPLETED") {
          const uploaded = result?.uploaded ?? expectedFiles ?? 0;
          const failed = result?.failed ?? 0;
          const detail =
            failed > 0
              ? `${uploaded} uploaded, ${failed} failed`
              : `${uploaded} file${uploaded === 1 ? "" : "s"} uploaded successfully`;
          markSuccess("Upload complete", detail);
          return;
        }

        if (status === "FAILED") {
          const failed = result?.failed ?? 0;
          const uploaded = result?.uploaded ?? 0;
          const detail = failed ? `${uploaded} uploaded, ${failed} failed` : undefined;
          markError("Upload failed", detail);
          return;
        }
      } catch (error) {
        console.warn("Polling upload status failed", error);
      }

      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, 2000);
        return;
      }

      if (!cancelled && attempts >= maxAttempts) {
        markError("Upload timed out", "Worker did not pick up the job. Check worker logs and retry.");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [queueJobId, expectedFiles, markError, markSuccess, updateProgress]);

  const shouldShow = state.status !== "idle";
  const progress = Math.min(100, Math.max(0, state.percent));
  const border =
    state.status === "error" ? "border-red-200" : state.status === "success" ? "border-emerald-200" : "border-[#DCE0E0]";
  const bar =
    state.status === "error"
      ? "bg-red-500"
      : state.status === "success"
        ? "bg-emerald-500"
        : "bg-[#3D64FF]";

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1100] w-[320px] rounded-3xl border bg-white/95 p-4 shadow-card-soft backdrop-blur transition">
      <div className="flex items-center justify-between">
        <div className={`text-sm font-semibold text-[#181B31] ${border}`}>
          <span>{state.message || "Uploading files"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4B5563]">{Math.round(progress)}%</span>
          <button
            type="button"
            aria-label="Close upload status"
            onClick={hide}
            className="rounded-full px-2 py-1 text-xs font-semibold text-[#6B7280] transition hover:bg-[#E5E7EB]"
          >
            ×
          </button>
        </div>
      </div>
      {state.detail && <p className="mt-1 text-xs text-[#4B5563]">{state.detail}</p>}
      {!state.detail && (
        <p className="mt-1 text-xs text-[#4B5563]">
          {state.status === "processing" ? "Processing in background..." : "Preparing upload..."}
        </p>
      )}
      <div className="mt-3 h-2 w-full rounded-full bg-[#E5E7EB]">
        <div
          className={`h-2 rounded-full transition-all ${bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
