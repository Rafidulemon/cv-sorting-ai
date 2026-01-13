'use client';

import { Download, FileSearch, Linkedin } from 'lucide-react';

type PreviewDraftProps = {
  mode: 'create' | 'upload';
  generatedJD: string;
  previewText: string;
  uploadedJdFileName: string | null;
  draftJobId: string | null;
  draftError: string;
  onDownloadDraft: () => void;
  onShareLinkedIn: () => void;
};

export default function PreviewDraft({
  mode,
  generatedJD,
  previewText,
  uploadedJdFileName,
  draftJobId,
  draftError,
  onDownloadDraft,
  onShareLinkedIn,
}: PreviewDraftProps) {
  const canExport = mode === 'create' && Boolean(generatedJD);

  return (
    <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-8 left-16 h-32 w-32 rounded-full bg-[#3D64FF]/15 blur-3xl" />
      </div>
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-[#3D64FF]" />
            <h2 className="text-lg font-semibold text-[#181B31]">Preview draft</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
            <button
              type="button"
              onClick={onDownloadDraft}
              disabled={!canExport}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                canExport
                  ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                  : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
              }`}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={onShareLinkedIn}
              disabled={!canExport}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                canExport
                  ? 'border border-[#0A66C2]/40 bg-[#0A66C2]/15 text-[#0A66C2] hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/25'
                  : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
              }`}
            >
              <Linkedin className="h-4 w-4" />
              Upload to LinkedIn
            </button>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs leading-relaxed text-[#4B5563]">
          {mode === 'upload' && uploadedJdFileName && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E7F3EF] px-3 py-1 text-[11px] font-semibold text-[#1B806A]">
              File attached: {uploadedJdFileName}
            </div>
          )}
          {mode === 'create' ? (
            previewText ? (
              <pre className="whitespace-pre-wrap font-sans text-[#4B5563]">{previewText}</pre>
            ) : (
              <p className="text-[#8A94A6]">Complete the prompts and generate a draft to review the AI&apos;s language.</p>
            )
          ) : previewText ? (
            <pre className="whitespace-pre-wrap font-sans text-[#4B5563]">{previewText}</pre>
          ) : (
            <p className="text-[#8A94A6]">Upload a description to preview it here.</p>
          )}
        </div>
        {draftJobId && <p className="text-xs font-semibold text-[#1B806A]">Draft saved. Job ID: {draftJobId}</p>}
        {draftError && <p className="text-xs font-semibold text-red-500">{draftError}</p>}
      </div>
    </div>
  );
}
