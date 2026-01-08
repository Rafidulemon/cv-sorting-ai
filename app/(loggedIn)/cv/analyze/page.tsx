'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  FileUp,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users2,
  X,
} from 'lucide-react';

const highlightMetrics = [
  {
    label: 'Overall signal',
    value: 'Strong fit',
    helper: '82% alignment to target role',
    icon: Sparkles,
  },
  {
    label: 'Experience depth',
    value: '6.4 years',
    helper: 'Backend and data platforms',
    icon: BarChart3,
  },
  {
    label: 'Team impact',
    value: 'Mentors 4 engineers',
    helper: 'Leadership evidence',
    icon: Users2,
  },
];

const reportSections = [
  {
    title: 'Strengths spotted',
    items: [
      'Scaled multi-tenant services to 1M+ users with 99.9% uptime.',
      'Owns end-to-end delivery from RFCs through launch.',
      'Hands-on with cloud cost optimization and observability.',
    ],
  },
  {
    title: 'Skill gaps to verify',
    items: ['Limited exposure to GraphQL and event sourcing.', 'No recent leadership of managers.'],
  },
  {
    title: 'Recommended roles',
    items: ['Senior Backend Engineer', 'Platform Engineer', 'Staff API Engineer'],
  },
  {
    title: 'Interview prompts',
    items: [
      'Walk through your most complex migration and the tradeoffs you made.',
      'How do you prioritize uptime vs new feature delivery?',
      'Describe the last time you introduced a new monitoring practice.',
    ],
  },
];

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CvAnalyzePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [notes, setNotes] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const fileMeta = useMemo(() => {
    if (!uploadedFile) return null;
    return {
      name: uploadedFile.name,
      size: formatFileSize(uploadedFile.size),
    };
  }, [uploadedFile]);

  useEffect(() => {
    if (processingState !== 'processing') return;

    const duration = 5200;
    const start = performance.now();
    let frameId = requestAnimationFrame(step);

    function step(now: number) {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / duration) * 100);
      setProgress(next);

      if (elapsed >= duration) {
        setProgress(100);
        setProcessingState('complete');
        return;
      }

      frameId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(frameId);
  }, [processingState]);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setProcessingState('idle');
    setProgress(0);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setProcessingState('idle');
    setProgress(0);
  };

  const startProcessing = () => {
    setProgress(0);
    setProcessingState('processing');
  };

  const closeOverlay = (reset: boolean) => {
    setShowOverlay(false);
    if (reset) {
      setProcessingState('idle');
      setProgress(0);
    }
  };

  const canGenerate = Boolean(uploadedFile);
  const showReport = processingState === 'complete';

  return (
    <>
      <div className="space-y-12 text-[#181B31]">
        <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
            <div className="absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
                Analyze a single CV
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
                Upload one CV to get a structured report with strengths, gaps, and interview-ready prompts in minutes.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <FileSearch className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Individual insight
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Privacy safe
                </span>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-80">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Report snapshot</p>
              <div className="space-y-3 text-sm text-[#4B5563]">
                <div className="flex items-center justify-between">
                  <span>Report type</span>
                  <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                    Single CV
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target role</span>
                  <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                    {targetRole || 'Not set'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8A94A6]">
                Export a shareable report with highlights and interview-ready questions.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-12 right-16 h-40 w-40 rounded-full bg-[#3D64FF]/20 blur-3xl" />
              </div>
              <div className="relative space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#181B31]">Upload CV</h2>
                    <p className="text-sm text-[#4B5563]">PDF, DOCX, or TXT up to 20MB.</p>
                  </div>
                  {uploadedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/15"
                    >
                      Remove file
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#DCE0E0] bg-[#FFFFFF] p-8 text-center text-sm text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/15">
                  <FileUp className="h-10 w-10 text-[#3D64FF]" />
                  <div>
                    <p className="text-base font-semibold text-[#181B31]">Drag &amp; drop CV</p>
                    <p className="mt-1 text-xs text-[#8A94A6]">
                      We will parse the file and auto-highlight strengths.
                    </p>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleUpload} />
                </label>

                {fileMeta ? (
                  <div className="rounded-3xl border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-3 text-xs font-medium text-[#3D64FF]">
                    {fileMeta.name} · {fileMeta.size}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-3 text-xs text-[#8A94A6]">
                    No CV added yet. Upload a file to continue.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
              <h3 className="text-lg font-semibold text-[#181B31]">Context for the report</h3>
              <p className="mt-1 text-sm text-[#4B5563]">
                Add a target role or notes so the report highlights the most relevant signals.
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-3 text-sm">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                    Target role
                  </label>
                  <input
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    className="mt-2 w-full bg-transparent text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
                    placeholder="e.g. Senior Backend Engineer"
                  />
                </div>
                <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-3 text-sm">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                    Notes for the reviewer
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="mt-2 w-full resize-none bg-transparent text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
                    placeholder="Focus on backend system design and leadership readiness."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
              <p>
                The AI will summarize experience, map skills to the target role, and generate interview prompts you can
                reuse in recruiter notes.
              </p>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOverlay(true)}
                  disabled={!canGenerate}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    canGenerate
                      ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20'
                      : 'border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6] cursor-not-allowed'
                  }`}
                >
                  Generate report
                  <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#181B31]">Report preview</h3>
                  <p className="text-sm text-[#4B5563]">
                    {showReport ? 'Report generated from the uploaded CV.' : 'Run the analysis to unlock insights.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!showReport}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    showReport
                      ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20'
                      : 'border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6] cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {highlightMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 shadow-card-soft"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/15 via-transparent to-transparent" />
                      <div className="relative space-y-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#DCE0E0] bg-[#3D64FF]/15 text-[#3D64FF]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                          {metric.label}
                        </p>
                        <p className="text-lg font-semibold text-[#181B31]">{metric.value}</p>
                        <p className="text-xs text-[#8A94A6]">{metric.helper}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
                <p className="font-semibold text-[#181B31]">Summary snapshot</p>
                <p className="mt-2">
                  {showReport
                    ? 'Demonstrates strong backend ownership, platform resilience work, and mentoring activity. Prioritize a deep dive on system design and cross-team influence.'
                    : 'Upload a CV and run analysis to generate the summary snapshot.'}
                </p>
              </div>
            </div>

            <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#3D64FF]" />
                <h3 className="text-lg font-semibold text-[#181B31]">Detailed report</h3>
              </div>
              <div className="mt-6 space-y-4">
                {reportSections.map((section) => (
                  <div key={section.title} className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4">
                    <p className="text-sm font-semibold text-[#181B31]">{section.title}</p>
                    <ul className="mt-2 space-y-2 text-xs text-[#4B5563]">
                      {section.items.map((item) => (
                        <li key={item}>- {showReport ? item : 'Generate report to view details.'}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181B31]/60 px-4 backdrop-blur">
          <div className="w-full max-w-xl overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft">
            {processingState === 'idle' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#181B31]">Confirm analysis</h3>
                    <p className="mt-1 text-sm text-[#4B5563]">
                      We will generate a tailored report for the uploaded CV in a few minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => closeOverlay(true)}
                    className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
                  <div className="flex items-center justify-between">
                    <span>CV</span>
                    <span className="font-semibold text-[#181B31]">{fileMeta?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Target role</span>
                    <span className="font-semibold text-[#181B31]">{targetRole || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report type</span>
                    <span className="font-semibold text-[#3D64FF]">Single CV analysis</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => closeOverlay(true)}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={startProcessing}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
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
                  <h3 className="text-lg font-semibold text-[#181B31]">Analyzing CV</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  Extracting skills, seniority signals, and narrative highlights. This usually takes around five
                  minutes.
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

            {processingState === 'complete' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success-500" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Report ready</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  The CV analysis is complete with strengths, gaps, and interview guidance ready to share.
                </p>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => closeOverlay(false)}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/15"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => closeOverlay(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
                  >
                    View report
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
