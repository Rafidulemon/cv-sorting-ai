'use client';

import { AlertTriangle, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';

type UploadDescriptionProps = {
  isUploadingJd: boolean;
  jdUploadError: string;
  uploadedJdFileName: string | null;
  jdVirusScanQueued: boolean;
  uploadedJdText: string;
  onJdTextChange: (value: string) => void;
  onUploadSelectedFile: (file: File) => void;
};

export default function UploadDescription({
  isUploadingJd,
  jdUploadError,
  uploadedJdFileName,
  jdVirusScanQueued,
  uploadedJdText,
  onJdTextChange,
  onUploadSelectedFile,
}: UploadDescriptionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const hasPastedText = Boolean(uploadedJdText.trim());
  const fileInputsDisabled = isUploadingJd || hasPastedText;
  const hasUploadedFile = Boolean(uploadedJdFileName);
  const uploadButtonDisabled = fileInputsDisabled || isUploadingJd;

  useEffect(() => {
    if (hasPastedText && selectedFile) {
      setSelectedFile(null);
    }
  }, [hasPastedText, selectedFile]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      onJdTextChange('');
    }
    event.target.value = '';
  };

  const handleUploadClick = () => {
    if (!selectedFile || isUploadingJd) return;
    onUploadSelectedFile(selectedFile);
    setSelectedFile(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#181B31]">Upload a file</p>
            <p className="text-xs text-[#8A94A6]">PDF, DOCX, DOC, or TXT up to 5MB.</p>
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
            accept=".pdf,.doc,.docx,.txt"
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
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploadButtonDisabled}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition ${
                uploadButtonDisabled
                  ? 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                  : 'border border-[#3D64FF]/40 bg-[#3D64FF]/10 text-[#3D64FF] hover:border-[#3D64FF]/60 hover:bg-[#3D64FF]/20'
              }`}
            >
              {isUploadingJd ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                'Upload file'
              )}
            </button>
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
          className="w-full rounded-3xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/15"
        />
        {hasUploadedFile && (
          <p className="text-[11px] font-semibold text-[#1C64F2]">Typing here will replace the uploaded file.</p>
        )}
      </div>
    </div>
  );
}
