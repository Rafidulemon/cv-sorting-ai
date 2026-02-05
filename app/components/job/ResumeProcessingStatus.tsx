'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { useJobCreation } from './JobCreationProvider';

export function ResumeProcessingStatus() {
  const {
    resumeProcessModalOpen,
    resumeProcessingState,
    resumeProcessProgress,
    resumeProcessError,
    resumeProcessCount,
    resumeProcessBackground,
    closeResumeProcessingModal,
    minimizeResumeProcessingModal,
    setResumeProcessBackground,
    confirmResumeProcessing,
    notProcessedCount,
  } = useJobCreation();

  useEffect(() => {
    if (resumeProcessModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [resumeProcessModalOpen]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // reset background panel when work completes or fails
    if (resumeProcessingState === 'complete' || resumeProcessingState === 'error') {
      setResumeProcessBackground(false);
    }
  }, [resumeProcessingState, setResumeProcessBackground]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const shouldShowModal = resumeProcessModalOpen;
  const shouldShowBackgroundPanel = resumeProcessBackground && resumeProcessingState === 'processing';

  if (!shouldShowModal && !shouldShowBackgroundPanel) return null;

  const percent = Math.min(100, Math.max(0, resumeProcessProgress));

  const runInBackground = () => {
    setResumeProcessBackground(true);
    minimizeResumeProcessingModal();
  };

  const renderContent = () => {
    switch (resumeProcessingState) {
      case 'confirm':
        return (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#181B31]">Start processing?</h3>
                <p className="mt-1 text-sm text-[#4B5563]">
                  Start processing {resumeProcessCount || notProcessedCount} unprocessed resume
                  {resumeProcessCount === 1 ? '' : 's'}. Text extraction, parsing, and embeddings will run in
                  the background.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResumeProcessingModal}
                className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
              <div className="flex items-center justify-between">
                <span>Pending resumes</span>
                <span className="rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold text-[#181B31]">
                  {resumeProcessCount || notProcessedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Steps</span>
                <span className="text-xs text-[#8A94A6]">Text → Parse → Embed → Score</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
              <button
                type="button"
                onClick={closeResumeProcessingModal}
                className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResumeProcessing}
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
              >
                Confirm &amp; start
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              </button>
            </div>
          </div>
        );
      case 'processing':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#3D64FF]" />
              <div>
                <h3 className="text-lg font-semibold text-[#181B31]">Processing resumes</h3>
                <p className="text-xs text-[#6B7280]">You can close this dialog; processing continues in background.</p>
              </div>
            </div>
            <p className="text-sm text-[#4B5563]">
              Extracting text, parsing fields, and building embeddings. You can close this dialog and progress will
              continue in the background.
            </p>
            <div className="space-y-3">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-[#6B7280]">Progress – {percent.toFixed(0)}%</p>
            </div>
            <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
              <button
                type="button"
                onClick={runInBackground}
                className="rounded-full border border-[#DCE0E0] bg-white px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
              >
                Run in background
              </button>
              <button
                type="button"
                onClick={closeResumeProcessingModal}
                className="rounded-full border border-[#DCE0E0] bg-white px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
              >
                Close
              </button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-[#181B31]">Couldn&apos;t start processing</h3>
            </div>
            <p className="text-sm text-[#4B5563]">{resumeProcessError || 'Try again in a moment.'}</p>
            <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
              <button
                type="button"
                onClick={closeResumeProcessingModal}
                className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmResumeProcessing}
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
              >
                Retry
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              </button>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-success-500" />
              <h3 className="text-lg font-semibold text-[#181B31]">Processing complete</h3>
            </div>
            <p className="text-sm text-[#4B5563]">
              All resumes have been parsed, embedded, and scored. Refresh the list to see updated statuses.
            </p>
            <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
              <button
                type="button"
                onClick={closeResumeProcessingModal}
                className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
              >
                Close
              </button>
              <Link
                href="/jobs"
                onClick={closeResumeProcessingModal}
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
              >
                Go to jobs
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (shouldShowModal) {
    return createPortal(
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-8 text-[#181B31] shadow-[0_30px_80px_-35px_rgba(0,0,0,0.55)]">
          {renderContent()}
        </div>
      </div>,
      document.body,
    );
  }

  // background panel (bottom-right, similar to upload overlay)
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[1100] w-[320px] rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-card-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#3D64FF]" />
          <div>
            <p className="text-sm font-semibold text-[#181B31]">Processing resumes</p>
            <p className="text-[11px] text-[#6B7280]">Running in background</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setResumeProcessBackground(false)}
          className="rounded-full p-1 text-[#8A94A6] transition hover:bg-[#F3F4F6] hover:text-[#181B31]"
          aria-label="Hide processing status"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-[#6B7280]">Progress – {percent.toFixed(0)}%</p>
      </div>
    </div>,
    document.body,
  );
}
