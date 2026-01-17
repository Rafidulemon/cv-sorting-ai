'use client';

import { AlertTriangle, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { JdProcessingModal, type FlowStatus } from '@/app/components/job/JdProcessingModal';

type UploadDescriptionProps = {
  isUploadingJd: boolean;
  jdUploadError: string;
  uploadedJdFileName: string | null;
  jdVirusScanQueued: boolean;
  uploadedJdText: string;
  jdProcessing: boolean;
  jdProcessingProgress: number;
  jdProcessingError: string;
  canProcessJd: boolean;
  onJdTextChange: (value: string) => void;
  onUploadSelectedFile: (file: File) => Promise<{ success: boolean; error?: string; text?: string; jobId?: string | null }>;
  onProcessJd: (
    textOverride?: string,
    jobIdOverride?: string | null,
    file?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
};

export default function UploadDescription({
  isUploadingJd,
  jdUploadError,
  uploadedJdFileName,
  jdVirusScanQueued,
  uploadedJdText,
  jdProcessing,
  jdProcessingProgress,
  jdProcessingError,
  canProcessJd,
  onJdTextChange,
  onUploadSelectedFile,
  onProcessJd,
}: UploadDescriptionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [flowProgress, setFlowProgress] = useState(0);
  const [flowError, setFlowError] = useState('');
  const hasPastedText = Boolean(uploadedJdText.trim());
  const hasUploadedFile = Boolean(uploadedJdFileName);
  const isBusy = isUploadingJd || jdProcessing || flowStatus === 'uploading' || flowStatus === 'processing';
  const lockAfterUpload = hasUploadedFile && !hasPastedText;
  const fileInputsDisabled = isBusy || hasPastedText || lockAfterUpload;
  const hasDescriptionSource = hasPastedText || hasUploadedFile || Boolean(selectedFile);
  const isFlowRunning = flowStatus === 'uploading' || flowStatus === 'processing' || isUploadingJd || jdProcessing;

  useEffect(() => {
    if (hasPastedText && selectedFile) {
      setSelectedFile(null);
    }
  }, [hasPastedText, selectedFile]);

  useEffect(() => {
    if (!showFlowModal) return;
    if (flowStatus !== 'processing') return;
    setFlowProgress((prev) => Math.max(prev, Math.min(95, jdProcessingProgress)));
  }, [flowStatus, jdProcessingProgress, showFlowModal]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      onJdTextChange('');
    }
    event.target.value = '';
  };

  const closeFlowModal = () => {
    setShowFlowModal(false);
    setFlowStatus('idle');
    setFlowProgress(0);
    setFlowError('');
  };

  const proceedToUploadCandidates = () => {
    closeFlowModal();
    const proceedButton = document.querySelector('[data-proceed-to-upload]') as HTMLButtonElement | null;
    proceedButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    proceedButton?.focus();
    proceedButton?.click();
  };

  const handleUploadAndProcess = async () => {
    if (!hasDescriptionSource || isFlowRunning) return;

    setShowFlowModal(true);
    setFlowError('');
    setFlowProgress(0);
    let textToProcess = hasPastedText ? uploadedJdText : '';
    let jobIdOverride: string | null | undefined;
    const fileToProcess = selectedFile;

    try {
      if (selectedFile) {
        setFlowStatus('uploading');
        setFlowProgress(12);
        const uploadResult = await onUploadSelectedFile(selectedFile);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || jdUploadError || 'Failed to upload job description.');
        }
        textToProcess = uploadResult.text || textToProcess;
        jobIdOverride = uploadResult.jobId ?? jobIdOverride;
        setFlowProgress(50);
        setSelectedFile(null);
      } else {
        setFlowStatus('processing');
        setFlowProgress(30);
      }

      setFlowStatus('processing');
      setFlowProgress((prev) => Math.max(prev, 65));
      const processResult = await onProcessJd(textToProcess || undefined, jobIdOverride, fileToProcess);
      if (!processResult.success) {
        throw new Error(processResult.error || jdProcessingError || 'Failed to process job description.');
      }
      setFlowProgress(100);
      setFlowStatus('success');
    } catch (error) {
      setFlowStatus('error');
      setFlowError((error as Error)?.message ?? 'Something went wrong while processing.');
      setFlowProgress((prev) => (prev > 12 ? prev : 18));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#181B31]">Upload a file</p>
                <p className="text-xs text-[#8A94A6]">PDF, DOCX, or TXT up to 5MB.</p>
              </div>
              {hasUploadedFile && (
                <span className="rounded-full bg-[#E7F3EF] px-3 py-1 text-[11px] font-semibold text-[#1B806A]">Uploaded</span>
              )}
            </div>
            <label
            className={`group relative flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#DCE0E0] bg-[#F7F8FC] p-6 text-center text-sm text-[#4B5563] transition ${
              fileInputsDisabled
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:border-[#3D64FF]/50 hover:bg-[#F0F4FF]'
            }`}
            >
              <UploadCloud className="h-9 w-9 text-[#3D64FF]" />
              <div>
                <p className="text-base font-semibold text-[#181B31]">Choose a file</p>
                <p className="mt-1 text-xs text-[#8A94A6]">Drag &amp; drop or click to browse.</p>
              </div>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
              disabled={fileInputsDisabled}
            />
            </label>
            {hasPastedText && (
              <p className="text-[11px] font-semibold text-[#A26B00]">Clear pasted text to enable file upload.</p>
            )}
            {selectedFile && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-3 text-xs text-[#4B5563]">
                <div className="space-y-1">
                  <p className="font-semibold text-[#181B31]">{selectedFile.name}</p>
                  <p className="text-[#8A94A6]">{(selectedFile.size / 1024).toFixed(1)} KB selected</p>
                </div>
                <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold text-[#3D64FF]">
                  Ready to upload &amp; process
                </span>
              </div>
            )}
            <div className="space-y-2">
              {isUploadingJd && (
                <p className="inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading securely...
                </p>
              )}
              {jdUploadError && (
                <p className="inline-flex items-center gap-2 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-2 text-xs font-semibold text-danger-700">
                  <AlertTriangle className="h-4 w-4" />
                  {jdUploadError}
                </p>
              )}
              {uploadedJdFileName && (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-2 text-xs font-semibold text-success-700">
                  <CheckCircle2 className="h-4 w-4" />
                  File ready: {uploadedJdFileName}
                  {jdVirusScanQueued && (
                    <span className="rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-700">
                      Virus scan queued
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#181B31]">Paste the job description</p>
                <p className="text-xs text-[#8A94A6]">Drop the raw text so we can parse it immediately.</p>
              </div>
            </div>
          <textarea
            value={uploadedJdText}
            onChange={(event) => onJdTextChange(event.target.value)}
            rows={12}
            placeholder="Paste the full job description here..."
            className="w-full rounded-3xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/15 disabled:cursor-not-allowed disabled:bg-[#F1F2F6] disabled:text-[#9CA3AF]"
            disabled={isBusy || lockAfterUpload}
          />
          {hasUploadedFile && (
            <p className="text-[11px] font-semibold text-[#1C64F2]">Typing here will replace the uploaded file.</p>
          )}
          </div>
        </div>

        <div className="space-y-3 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#181B31]">Upload &amp; process together</p>
              <p className="text-xs text-[#8A94A6]">
                Securely upload the description and let AI extract the details in one step.
              </p>
            </div>
            <button
              type="button"
              onClick={handleUploadAndProcess}
              disabled={
                !hasDescriptionSource ||
                isFlowRunning ||
                isBusy ||
                lockAfterUpload ||
                (!canProcessJd && !selectedFile)
              }
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                !hasDescriptionSource || isFlowRunning || isBusy || lockAfterUpload || (!canProcessJd && !selectedFile)
                  ? 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                  : 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
              }`}
            >
              {isFlowRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {flowStatus === 'uploading' || isUploadingJd ? 'Uploading' : 'Processing'}
                </>
              ) : (
                'Upload & Process'
              )}
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#8A94A6]">
              <span>We’ll show the live progress in a modal while we work.</span>
              {hasUploadedFile && !hasPastedText && (
                <span className="font-semibold text-[#1B806A]">Last upload ready</span>
              )}
            </div>
            {!hasDescriptionSource && (
              <p className="inline-flex items-center gap-2 rounded-2xl border border-[#F1C21B] bg-[#FFF7E6] px-4 py-2 text-xs font-semibold text-[#A26B00]">
                <AlertTriangle className="h-4 w-4" />
                Add a file or paste a job description to start.
              </p>
            )}
            {(jdProcessingError || jdUploadError) && (
              <p className="inline-flex items-center gap-2 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-2 text-xs font-semibold text-danger-700">
                <AlertTriangle className="h-4 w-4" />
                {jdProcessingError || jdUploadError}
              </p>
            )}
          </div>
        </div>
      </div>

      <JdProcessingModal
        open={showFlowModal}
        status={flowStatus}
        progress={flowProgress}
        flowError={flowError}
        jdProcessingError={jdProcessingError}
        onClose={closeFlowModal}
        onProceed={proceedToUploadCandidates}
      />
    </>
  );
}
