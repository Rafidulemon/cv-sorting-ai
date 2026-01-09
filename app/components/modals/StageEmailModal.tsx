import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Mail, X } from 'lucide-react';
import type { CandidateStage } from '@/app/(client)/results/data';

type StageEmailModalProps = {
  open: boolean;
  onClose: () => void;
  stage: CandidateStage;
  candidateName: string;
  jobId?: string;
};

const stageEmailMeta: Record<
  CandidateStage,
  { label: string; subject: (candidateName: string, jobId?: string) => string; body: (candidateName: string, jobId?: string) => string }
> = {
  shortlist: {
    label: 'Interview',
    subject: (candidateName, jobId) => `Interview invitation${jobId ? ` for ${decodeURIComponent(jobId)}` : ''}`,
    body: (candidateName, jobId) =>
      `Hi ${candidateName},\n\nWe were impressed by your background and would like to invite you to an interview${
        jobId ? ` for ${decodeURIComponent(jobId)}` : ''
      }.\n\nPlease share your availability for the next few days and any scheduling preferences.\n\nBest,\nHiring Team`,
  },
  hold: {
    label: 'Status Update',
    subject: (candidateName, jobId) => `Application update${jobId ? ` for ${decodeURIComponent(jobId)}` : ''}`,
    body: (candidateName, jobId) =>
      `Hi ${candidateName},\n\nThank you for your interest${
        jobId ? ` in ${decodeURIComponent(jobId)}` : ''
      }. We are continuing to review applications and will be in touch with next steps.\n\nBest,\nHiring Team`,
  },
  rejected: {
    label: 'Rejection',
    subject: (candidateName, jobId) => `Update on your application${jobId ? ` for ${decodeURIComponent(jobId)}` : ''}`,
    body: (candidateName) =>
      `Hi ${candidateName},\n\nThank you for taking the time to apply. After careful consideration, we will not be moving forward at this time.\n\nWe appreciate your interest and wish you the best in your search.\n\nBest,\nHiring Team`,
  },
};

export function StageEmailModal({ open, onClose, stage, candidateName, jobId }: StageEmailModalProps) {
  const template = useMemo(() => stageEmailMeta[stage], [stage]);
  const [subject, setSubject] = useState(template.subject(candidateName, jobId));
  const [message, setMessage] = useState(template.body(candidateName, jobId));

  useEffect(() => {
    if (open) {
      setSubject(template.subject(candidateName, jobId));
      setMessage(template.body(candidateName, jobId));
    }
  }, [open, template, candidateName, jobId]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className={`mb-8 w-full max-w-2xl transform rounded-3xl border border-[#DCE0E0] bg-white shadow-[0_30px_90px_rgba(17,24,39,0.2)] transition-all duration-300 ${
          open ? 'translate-y-0' : 'translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#EEF2F7] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3D64FF]/10 text-[#3D64FF]">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#181B31]">{template.label} email</p>
              <p className="text-xs text-[#6B7280]">
                To {candidateName} {jobId ? `· ${decodeURIComponent(jobId)}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#6B7280] transition hover:bg-[#F2F4F7] hover:text-[#181B31]"
            aria-label="Close email modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label htmlFor="email-subject" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-2xl border border-[#DCE0E0] bg-[#FBFCFE] px-3 py-3 text-sm text-[#1F2A44] outline-none transition focus:border-[#3D64FF]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email-body" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              Message
            </label>
            <textarea
              id="email-body"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="h-40 w-full resize-none rounded-2xl border border-[#DCE0E0] bg-[#FBFCFE] px-3 py-3 text-sm text-[#1F2A44] outline-none transition focus:border-[#3D64FF]"
            />
            <p className="text-xs text-[#6B7280]">Edit the copy before sending to match your tone.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#1B806A]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Template prefilled for the current stage</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#DCE0E0] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1F2A44] transition hover:border-[#3D64FF]/50 hover:text-[#3D64FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3D64FF] to-[#1B806A] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:shadow-lg"
              >
                <Mail className="h-4 w-4" />
                Send email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
