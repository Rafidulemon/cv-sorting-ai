'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { useJobCreation } from './JobCreationProvider';

export function JobCreationStatus() {
  const {
    showConfirmation,
    handleCloseOverlay,
    processingState,
    setProcessingState,
    progress,
    setProgress,
    submitError,
    setSubmitError,
    handleConfirmRun,
    canStartSorting,
    createdJobId,
    uploadedResumes,
    topCandidates,
    costUsage,
    sortingBackground,
    openSortingOverlay,
    runSortingInBackground,
  } = useJobCreation();

  useEffect(() => {
    if (showConfirmation) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [showConfirmation]);

  if (!showConfirmation) {
    return null;
  }

  const modal = showConfirmation
    ? createPortal(
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 backdrop-blur-md px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_25px_70px_-30px_rgba(0,0,0,0.65)]">
            {processingState === 'idle' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#181B31]">Confirm run</h3>
                    <p className="mt-1 text-sm text-[#4B5563]">
                      We&apos;ll rank all uploaded CVs against your description. This takes a few minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCloseOverlay()}
                    className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
                  <div className="flex items-center justify-between">
                    <span>CVs queued</span>
                    <span className="font-semibold text-[#181B31]">{uploadedResumes.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Top candidates requested</span>
                    <span className="font-semibold text-[#181B31]">{topCandidates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits consumed</span>
                    <span className="font-semibold text-[#3D64FF]">
                      {costUsage.consumed} of {costUsage.total}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => handleCloseOverlay()}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRun}
                    disabled={!canStartSorting}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 transition ${
                      canStartSorting
                        ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                        : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                    }`}
                  >
                    Confirm &amp; run
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </button>
                </div>
              </div>
            )}

            {processingState === 'processing' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#3D64FF]" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Creating job</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  Saving your job, storing the preview as HTML, and queuing the first sorting run. This should only take
                  a moment.
                </p>
                <div className="space-y-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE0E0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/60 to-[#3D64FF] transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#8A94A6]">Progress - {progress.toFixed(0)}%</p>
                </div>
                <div className="flex justify-end text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={runSortingInBackground}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Run in background
                  </button>
                </div>
              </div>
            )}

            {processingState === 'error' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Couldn&apos;t create job</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  {submitError || 'Something went wrong saving this job. Try again in a moment.'}
                </p>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => {
                      setProcessingState('idle');
                      setSubmitError('');
                      setProgress(0);
                    }}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRun}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                  >
                    Retry
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </button>
                </div>
              </div>
            )}

            {processingState === 'complete' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success-500" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Job created</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  We saved the role, including your preview HTML, and queued the initial sorting. You can review and edit
                  it from the Jobs area.
                </p>
                {createdJobId && (
                  <p className="text-xs text-[#8A94A6]">Job ID: {createdJobId}</p>
                )}
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                  onClick={() => handleCloseOverlay()}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Close
                  </button>
                  <Link
                    href="/jobs"
                    onClick={() => handleCloseOverlay()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                  >
                    Go to jobs
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  const backgroundPanel =
    sortingBackground && processingState === 'processing'
      ? createPortal(
        <div className="fixed bottom-6 right-6 z-[1050] w-[320px] rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-card-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#181B31]">Sorting resumes</p>
              <p className="text-[11px] text-[#6B7280]">Running in background</p>
            </div>
            <button
              type="button"
              onClick={openSortingOverlay}
              className="rounded-full border border-[#DCE0E0] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/60 hover:bg-[#F0F2F8]"
            >
              View
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-[#6B7280]">Progress – {progress.toFixed(0)}%</p>
          </div>
        </div>,
        document.body,
      )
      : null;

  return (
    <>
      {modal}
      {backgroundPanel}
    </>
  );
}
