'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import Button from '@/app/components/buttons/Button';

export type FlowStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

type JdProcessingModalProps = {
  open: boolean;
  status: FlowStatus;
  progress: number;
  flowError: string;
  jdProcessingError: string;
  onClose: () => void;
  onProceed: () => void;
};

export function JdProcessingModal({
  open,
  status,
  progress,
  flowError,
  jdProcessingError,
  onClose,
  onProceed,
}: JdProcessingModalProps) {
  const canDismiss = status !== 'uploading' && status !== 'processing';

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!canDismiss) return;
        onClose();
      }}
    >
      <div
        className="relative mx-auto w-[min(720px,calc(100%-2rem))] max-h-[88vh] overflow-hidden transform rounded-3xl border border-white/70 bg-white/95 shadow-[0_32px_100px_rgba(24,27,49,0.22)] transition-all duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] bg-gradient-to-r from-[#fef8ff] via-[#f5f6ff] to-white px-6 py-5">
          <div className="flex items-center gap-3">
            {status === 'success' ? (
              <CheckCircle2 className="h-12 w-12 text-success-500 animate-bounce" />
            ) : status === 'error' ? (
              <XCircle className="h-12 w-12 text-danger-500 animate-pulse" />
            ) : (
              <Loader2 className="h-10 w-10 animate-spin text-[#3D64FF]" />
            )}
            <div>
              <p className="text-lg font-semibold text-[#181B31]">Processing description</p>
              <p className="text-sm text-[#4B5563]">
                {status === 'uploading'
                  ? 'Securely uploading your job description.'
                  : status === 'processing'
                    ? 'Extracting key details with AI.'
                    : status === 'success'
                      ? 'All set! We captured the title, responsibilities, and skills.'
                      : status === 'error'
                        ? flowError || 'Something went wrong while processing.'
                        : 'Preparing to start.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!canDismiss}
            className="rounded-full p-2 text-[#6b7280] transition hover:bg-[#f2f4f7] hover:text-[#1f2a44] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close processing modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  status === 'error'
                    ? 'bg-danger-500'
                    : 'bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF]'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5563]">
              <span>
                {status === 'uploading'
                  ? 'Uploading securely...'
                  : status === 'processing'
                    ? 'Processing with OpenAI'
                    : status === 'success'
                      ? 'Completed'
                      : status === 'error'
                        ? 'Error'
                        : 'Idle'}
              </span>
              <span className="font-semibold text-[#181B31]">{progress.toFixed(0)}%</span>
            </div>
          </div>

          {status === 'error' && (
            <p className="flex items-start gap-2 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              {flowError || jdProcessingError || 'We could not process this job description.'}
            </p>
          )}

          {status === 'success' && (
            <p className="flex items-start gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-semibold text-success-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              Parsing complete. You can adjust the extracted details before moving on.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="primary" size="sm" onClick={onProceed} disabled={!canDismiss}>
              Proceed to upload candidates
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={!canDismiss}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
