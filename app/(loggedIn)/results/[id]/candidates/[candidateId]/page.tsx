'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Mail, MessageSquare, Sparkles, Star } from 'lucide-react';
import { AskCarriXModal } from '@/app/components/modals/AskCarriXModal';
import { StageEmailModal } from '@/app/components/modals/StageEmailModal';
import type { CandidateStage } from '../../../data';
import { candidateResults, requiredSkills, stageMeta } from '../../../data';

export default function CandidateDetailPage() {
  const params = useParams<{ id: string | string[]; candidateId: string | string[] }>();
  const jobIdRaw = params?.id;
  const candidateIdRaw = params?.candidateId;
  const jobId = Array.isArray(jobIdRaw) ? jobIdRaw[0] : jobIdRaw;
  const candidateId = Array.isArray(candidateIdRaw) ? candidateIdRaw[0] : candidateIdRaw;

  const candidate = useMemo(
    () => candidateResults.find((item) => item.id === candidateId),
    [candidateId],
  );
  const [stage, setStage] = useState<CandidateStage>(candidate?.stage ?? 'shortlist');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!candidate) {
    return (
      <div className="space-y-6 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 text-[#181B31] shadow-card-soft">
        <p className="text-lg font-semibold">Candidate not found</p>
        <p className="text-sm text-[#4B5563]">Return to the results page to pick another profile.</p>
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
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">CV highlights</p>
              </div>
              <p className="leading-relaxed text-[#4B5563]">{candidate.cvText}</p>
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
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                <object data="/dummy_resume.pdf" type="application/pdf" className="h-[85vh] min-h-[500px] w-full">
                  <p className="p-3 text-xs text-[#6B7280]">
                    Preview unavailable.{' '}
                    <Link href="/dummy_resume.pdf" className="text-[#3D64FF] underline">
                      Open dummy_resume.pdf
                    </Link>
                  </p>
                </object>
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
            <p className="text-sm text-[#4B5563]">Overview of match vs gap weighting.</p>
            <div className="flex items-center justify-center">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3D64FF] via-[#4F7BFF] to-[#1B806A] opacity-80" />
                <div className="absolute inset-3 rounded-full bg-white" />
                <div className="absolute inset-6 rounded-full bg-[#F5F7FB]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-[#181B31]">{candidate.matchScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5563]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#3D64FF]" />
                Matches
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1B806A]" />
                Potential
              </span>
            </div>
          </div>
        </div>
      </div>
      {!showAskModal && (
        <button
          type="button"
          onClick={() => setShowAskModal(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <MessageSquare className="h-4 w-4" />
          Ask carriX about this CV
        </button>
      )}
      <AskCarriXModal
        open={showAskModal}
        onClose={() => setShowAskModal(false)}
        candidateName={candidate.name}
        jobId={jobId ?? undefined}
      />
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
