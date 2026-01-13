'use client';

import Link from 'next/link';
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
    uploadedFiles,
    topCandidates,
    costUsage,
  } = useJobCreation();

  if (!showConfirmation) {
    return null;
  }

  return (
    <>
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181B31]/60 px-4 backdrop-blur">
          <div className="w-full max-w-xl overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft">
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
                    onClick={handleCloseOverlay}
                    className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
                  <div className="flex items-center justify-between">
                    <span>CVs queued</span>
                    <span className="font-semibold text-[#181B31]">{uploadedFiles.length || 47}</span>
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
                    onClick={handleCloseOverlay}
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
                    onClick={handleCloseOverlay}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Close
                  </button>
                  <Link
                    href="/jobs"
                    onClick={handleCloseOverlay}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                  >
                    Go to jobs
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
