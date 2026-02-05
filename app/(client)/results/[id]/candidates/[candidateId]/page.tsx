'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Percent,
  Sparkles,
  Star,
} from 'lucide-react';
import { AskCarriXModal } from '@/app/components/modals/AskCarriXModal';
import { StageEmailModal } from '@/app/components/modals/StageEmailModal';
import type { CandidateResult, CandidateStage } from '../../../data';
import { stageMeta } from '../../../data';

export default function CandidateDetailPage() {
  const params = useParams<{ id: string | string[]; candidateId: string | string[] }>();
  const jobIdRaw = params?.id;
  const candidateIdRaw = params?.candidateId;
  const jobId = Array.isArray(jobIdRaw) ? jobIdRaw[0] : jobIdRaw;
  const candidateId = Array.isArray(candidateIdRaw) ? candidateIdRaw[0] : candidateIdRaw;

  const [candidate, setCandidate] = useState<CandidateResult | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [stage, setStage] = useState<CandidateStage>('shortlist');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCandidate = async () => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/results`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        const body = (await res.json()) as { candidates: CandidateResult[]; requiredSkills?: string[] };
        const found = body.candidates?.find((item) => item.id === candidateId) ?? null;
        setCandidate(found);
        setRequiredSkills(body.requiredSkills ?? []);
        if (found) setStage(found.stage);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
    return () => controller.abort();
  }, [jobId, candidateId]);

  useEffect(() => {
    if (!candidate || !jobId) return;
    const controller = new AbortController();
    const loadResume = async () => {
      try {
        setResumePreviewLoading(true);
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/resumes`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const payload = await res.json();
        const rows: { resumeId?: string; publicUrl?: string | null }[] = Array.isArray(payload?.files)
          ? payload.files
          : [];
        const match = rows.find((file) => file.resumeId === candidate.id);
        if (match?.publicUrl) setResumePreviewUrl(match.publicUrl);
      } finally {
        setResumePreviewLoading(false);
      }
    };
    loadResume();
    return () => controller.abort();
  }, [candidate, jobId]);

  if (loading) {
    return (
      <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-white p-8 text-[#181B31] shadow-card-soft">
        <div className="flex items-center gap-3 text-sm text-[#4B5563]">
          <Loader2 className="h-4 w-4 animate-spin text-[#3D64FF]" />
          Loading candidate details...
        </div>
        <div className="h-4 w-48 animate-pulse rounded-full bg-[#EEF2F7]" />
        <div className="h-64 animate-pulse rounded-3xl bg-gradient-to-r from-[#F8FAFC] via-[#EEF2F7] to-[#F8FAFC]" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-6 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 text-[#181B31] shadow-card-soft">
        <p className="text-lg font-semibold">{error ? 'Unable to load candidate' : 'Candidate not found'}</p>
        <p className="text-sm text-[#4B5563]">
          {error || 'Return to the results page to pick another profile.'}
        </p>
        <Link
          href={`/results/${jobId ?? ''}`}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
      </div>
    );
  }

  const missingSkills = candidate.skillGap.required.filter((skill) => !candidate.skillGap.present.includes(skill));
  const matchedSkills = candidate.skillGap.present;
  const matchedCount = matchedSkills.length;
  const requiredCount = candidate.skillGap.required.length || 1;
  const skillsMatchPct = Math.round((matchedCount / requiredCount) * 100);
  const overallMatchPct = Math.round(candidate.matchScore);
  const gapPct = Math.max(0, 100 - overallMatchPct);

  const highlights = candidate.cvText
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 4)
    .slice(0, 6);

  const moveToStage = (nextStage: CandidateStage) => {
    setStage(nextStage);
    setStatusMessage(`Moved to ${stageMeta[nextStage].label} for job ${jobId ?? ''}`);
  };

  const stageActions: Array<{ value: CandidateStage; label: string; helper: string; tone: string }> = [
    { value: 'shortlist', label: 'Shortlist', helper: 'Ready to advance', tone: 'text-[#1B806A]' },
    { value: 'hold', label: 'Hold', helper: 'Keep for later', tone: 'text-[#9A5B00]' },
    { value: 'rejected', label: 'Reject', helper: 'Not a fit', tone: 'text-[#B91C1C]' },
  ];

  const stageEmailCta: Record<CandidateStage, string> = {
    shortlist: 'Send Interview Email',
    hold: 'Send Status Email',
    rejected: 'Send Rejection Email',
  };

  return (
    <div className="space-y-8 text-[#181B31]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] px-6 py-5 shadow-card-soft">
        <div className="space-y-2">
          <Link
            href={`/results/${jobId ?? ''}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6] transition hover:text-[#3D64FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{candidate.name}</h1>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stageMeta[stage].className}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {stageMeta[stage].label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-sm font-semibold text-success-700">
              {candidate.matchScore}% match
            </span>
          </div>
          <p className="text-sm text-[#4B5563]">{candidate.experience}</p>
        </div>
        {statusMessage && (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EA] px-4 py-2 text-xs font-semibold text-[#1B806A]">
            <CheckCircle2 className="h-4 w-4" />
            {statusMessage}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
          <h3 className="text-lg font-semibold">Job blueprint</h3>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Required skills</p>
          <ul className="mt-2 space-y-2 text-sm text-[#4B5563]">
            {requiredSkills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-2 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] px-3 py-2"
              >
                <Star className="h-4 w-4 text-[#3D64FF]" />
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <h2 className="text-lg font-semibold">Profile overview</h2>
            <p className="text-sm leading-relaxed text-[#4B5563]">{candidate.summary}</p>
            <div className="space-y-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-4 text-sm text-[#1F2A44]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Matched skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/10 px-3 py-1 text-xs font-semibold text-[#3D64FF]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-4 text-sm text-[#1F2A44]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Job-match highlights</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#3D64FF]">
                  Match strength {overallMatchPct}%
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {matchedSkills.slice(0, 6).map((skill) => (
                  <div
                    key={skill}
                    className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B806A]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#1B806A]" />
                    <div>
                      <p className="font-semibold text-[#1F2937]">{skill}</p>
                      <p className="text-xs text-[#4B5563]">Evidence found in resume and aligned to required skills.</p>
                    </div>
                  </div>
                ))}
                {highlights.slice(0, 2).map((point, idx) => (
                  <div
                    key={`${point}-${idx}`}
                    className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151]"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-[#3D64FF]" />
                    <div>
                      <p className="font-semibold text-[#1F2937]">Resume evidence</p>
                      <p className="text-xs text-[#4B5563]">{point}</p>
                    </div>
                  </div>
                ))}
                {!matchedSkills.length && !highlights.length && (
                  <p className="text-sm text-[#6B7280]">No highlights extracted yet.</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Strengths</p>
                <ul className="space-y-2 text-sm">
                  {candidate.skillGap.present.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 text-[#1B806A]">
                      <CheckCircle2 className="h-4 w-4 text-[#1B806A]" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Gaps</p>
                <ul className="space-y-2 text-sm">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2 text-[#B91C1C]">
                        <AlertTriangle className="h-4 w-4" />
                        {skill}
                      </li>
                    ))
                  ) : (
                    <li className="text-[#6B7280]">No missing required skills detected.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <h3 className="text-lg font-semibold">CV preview</h3>
            <div className="space-y-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-4 text-sm text-[#1F2A44] shadow-inner">
              <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                {resumePreviewLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                    <Loader2 className="h-6 w-6 animate-spin text-[#3D64FF]" />
                  </div>
                )}
                {resumePreviewUrl ? (
                  <object data={resumePreviewUrl} type="application/pdf" className="h-[85vh] min-h-[520px] w-full">
                    <p className="p-3 text-xs text-[#6B7280]">
                      Preview unavailable.{' '}
                      <Link href={resumePreviewUrl} className="text-[#3D64FF] underline">
                        Open resume
                      </Link>
                    </p>
                  </object>
                ) : (
                  <div className="flex h-[260px] flex-col items-center justify-center gap-3 p-6 text-center text-[#4B5563]">
                    <FileText className="h-8 w-8 text-[#9CA3AF]" />
                    <p className="text-sm">Resume preview not available yet.</p>
                    <p className="text-xs text-[#9CA3AF]">Upload may still be processing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <h3 className="text-lg font-semibold">Move candidate</h3>
            <p className="text-sm text-[#4B5563]">
              Update this CV&apos;s stage for {jobId ? decodeURIComponent(jobId) : 'the job'}.
            </p>
            <div className="flex flex-col gap-3">
              {stageActions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => moveToStage(action.value)}
                  className={`inline-flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    stage === action.value
                      ? 'border-[#3D64FF]/50 bg-[#3D64FF]/10 text-[#3D64FF]'
                      : 'border-[#DCE0E0] bg-[#F9FAFB] text-[#1F2A44] hover:border-[#3D64FF]/40 hover:bg-[#F5F7FB]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full bg-current ${action.tone}`} />
                    {action.label}
                  </span>
                  <span className="text-xs text-[#6B7280]">{action.helper}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#3D64FF]/30 bg-[#3D64FF]/10 px-4 py-3 text-sm font-semibold text-[#3D64FF] transition hover:border-[#3D64FF]/60 hover:bg-[#3D64FF]/20"
            >
              <Mail className="h-4 w-4" />
              {stageEmailCta[stage]}
            </button>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <h3 className="text-lg font-semibold">Score mix</h3>
            <p className="text-sm text-[#4B5563]">Explains why this profile scored {overallMatchPct}% and what&apos;s missing.</p>
            <div className="space-y-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#181B31]">
                <Percent className="h-4 w-4 text-[#3D64FF]" />
                Score breakdown
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full bg-[#3D64FF]"
                  style={{ width: `${overallMatchPct}%` }}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-xs text-[#4B5563]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#3D64FF]" />
                  Matched: {overallMatchPct}% (skills matched: {skillsMatchPct}%)
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                  Gaps: {gapPct}% ({missingSkills.length} missing skills)
                </span>
              </div>
              <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#374151]">
                <p className="font-semibold text-[#181B31]">Why {overallMatchPct}%</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>{matchedCount} of {requiredCount} required skills found: {matchedSkills.slice(0, 5).join(', ') || 'none yet'}.</li>
                  <li>Missing skills: {missingSkills.slice(0, 5).join(', ') || 'none detected'}.</li>
                </ul>
                <p className="text-[#6B7280]">Addressing the gaps above would raise the score toward 100%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {!showAskModal && (
        <button
          type="button"
          onClick={() => setShowAskModal(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <MessageSquare className="h-4 w-4" />
          Ask carriX about this CV
        </button>
      )} */}
      {/* <AskCarriXModal
        open={showAskModal}
        onClose={() => setShowAskModal(false)}
        candidateName={candidate.name}
        jobId={jobId ?? undefined}
      /> */}
      <StageEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        stage={stage}
        candidateName={candidate.name}
        jobId={jobId ?? undefined}
      />
    </div>
  );
}
