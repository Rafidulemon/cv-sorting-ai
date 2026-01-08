import { useEffect, useState } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';

type AskCarriXModalProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  jobId?: string;
};

const promptSuggestions = [
  'Summarize this CV in 3 bullet points',
  'What questions should I ask in an interview?',
  'Highlight any leadership experience',
  'Are there red flags I should know about?',
];

export function AskCarriXModal({ open, onClose, candidateName, jobId }: AskCarriXModalProps) {
  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (!open) {
      setQuestion('');
    }
  }, [open]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[28rem] max-w-[calc(100%-2rem)] transform transition-all duration-300 ${
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="overflow-hidden rounded-3xl border border-[#DCE0E0] bg-white shadow-[0_25px_80px_rgba(17,24,39,0.18)]">
        <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3D64FF]/10 text-[#3D64FF]">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#181B31]">Ask carriX about this CV</p>
              <p className="text-xs text-[#6B7280]">
                {candidateName} {jobId ? `· ${decodeURIComponent(jobId)}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#6B7280] transition hover:bg-[#F2F4F7] hover:text-[#181B31]"
            aria-label="Close ask carriX modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#EEF2F7] bg-[#F8FAFD] px-4 py-3">
            <Sparkles className="mt-1 h-4 w-4 text-[#3D64FF]" />
            <div className="space-y-1 text-sm text-[#1F2A44]">
              <p className="font-semibold text-[#181B31]">Need guidance?</p>
              <p className="text-[#4B5563]">
                carriX can pull highlights, suggest interview questions, or compare this CV to your job blueprint.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="carrix-question" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              Your question
            </label>
            <textarea
              id="carrix-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="h-28 w-full resize-none rounded-2xl border border-[#DCE0E0] bg-[#FBFCFE] px-3 py-3 text-sm text-[#1F2A44] outline-none transition focus:border-[#3D64FF]"
              placeholder="Ask anything about this CV..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="rounded-full border border-[#DCE0E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2A44] transition hover:border-[#3D64FF]/50 hover:text-[#3D64FF]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-[#6B7280]">Responses will appear inline.</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3D64FF] to-[#1B806A] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:shadow-lg"
            >
              <Send className="h-4 w-4" />
              Ask carriX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
