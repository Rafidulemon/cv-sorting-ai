'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  Filter,
  FileBarChart,
  FileText,
  ScrollText,
  Sparkles,
  Star,
} from 'lucide-react';
import type { Candidate } from '../../../types';

const candidates: Candidate[] = [
  {
    id: 'cand-001',
    name: 'Avery Johnson',
    matchScore: 92,
    matchedSkills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
    experience: '6 years | TechNova Labs',
    summary:
      'Senior backend engineer delivering scalable APIs and distributed systems with a focus on reliability.',
    skillGap: {
      required: ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'],
      present: ['Python', 'Django', 'AWS', 'REST APIs'],
    },
    cvText:
      'Lead backend development for AI-driven analytics platform, architected microservices with Python and Django. Managed cloud infrastructure on AWS (ECS, Lambda, RDS)...',
  },
  {
    id: 'cand-002',
    name: 'Jordan Patel',
    matchScore: 88,
    matchedSkills: ['Python', 'FastAPI', 'Kafka', 'CI/CD'],
    experience: '5 years | Orbit Systems',
    summary:
      'Built low-latency data pipelines and modernized CI/CD workflows. Experience mentoring junior engineers.',
    skillGap: {
      required: ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'],
      present: ['Python', 'FastAPI', 'CI/CD', 'REST APIs'],
    },
    cvText:
      'Engineering lead for event-driven services with FastAPI and Kafka. Implemented automation suite with GitHub Actions, Terraform on AWS...',
  },
  {
    id: 'cand-003',
    name: 'Emilia Chen',
    matchScore: 83,
    matchedSkills: ['Python', 'Django', 'GraphQL', 'People Management'],
    experience: '7 years | Northwind Tech',
    summary:
      'Managed a team of 5 engineers building subscription commerce tooling. Strong focus on cross-team collaboration.',
    skillGap: {
      required: ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'],
      present: ['Python', 'Django', 'Team Leadership', 'GraphQL'],
    },
    cvText:
      'Directed roadmap delivery for subscription billing platform. Introduced OKR process and improved on-call reliability metrics...',
  },
  {
    id: 'cand-004',
    name: 'Noah Murphy',
    matchScore: 76,
    matchedSkills: ['Python', 'Serverless', 'AWS', 'Monitoring'],
    experience: '4 years | Skyward Analytics',
    summary:
      'Full-stack engineer specialising in serverless architectures and observability tooling.',
    skillGap: {
      required: ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'],
      present: ['Python', 'AWS', 'Serverless', 'Monitoring'],
    },
    cvText:
      'Designed telemetry pipelines with AWS Lambda and Kinesis. Delivered customer dashboards in React with robust alerting integrations...',
  },
];

const requiredSkills = ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'];

export default function ResultsPage() {
  const params = useParams<{ id: string | string[] }>();
  const jobIdRaw = params?.id;
  const jobId = Array.isArray(jobIdRaw) ? jobIdRaw[0] : jobIdRaw;
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [skillFilter, setSkillFilter] = useState('');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(candidates[0].id);

  const filteredCandidates = useMemo(() => {
    const filtered = skillFilter
      ? candidates.filter((candidate) =>
          candidate.matchedSkills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
        )
      : candidates;

    return [...filtered].sort((a, b) =>
      sortBy === 'score' ? b.matchScore - a.matchScore : a.name.localeCompare(b.name),
    );
  }, [skillFilter, sortBy]);

  const shortlisted = filteredCandidates.slice(0, 10);
  const topCandidate = shortlisted[0];
  const metrics = [
    { label: 'CVs processed', value: '47', helper: '12 shortlisted this run' },
    { label: 'Avg. match score', value: '82%', helper: '+4% vs previous cycle' },
    { label: 'Time saved', value: '6.2h', helper: 'Compared to manual review' },
  ];
  const averageCoverage =
    shortlisted.length === 0
      ? null
      : Math.round(
          (shortlisted.reduce((acc, candidate) => acc + candidate.skillGap.present.length, 0) /
            (shortlisted.length * requiredSkills.length)) *
            100,
        );

  return (
    <div className="space-y-12 text-[#181B31]">
        <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
            <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
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
                Results - {jobId ? decodeURIComponent(jobId) : 'Unknown job'}
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
                47 CVs analysed with semantic scoring, interview-readiness weighting, and bias safeguards. Refine the
                shortlist or export the full audit trail.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Semantic scoring
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <FileBarChart className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Explainable ranking
                </span>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-80">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Quick actions</p>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
                <Download className="h-4 w-4" />
                Download full report
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15">
                <FileText className="h-4 w-4" />
                Generate share link
              </button>
              <p className="text-xs text-[#8A94A6]">
                Includes candidate rationales, score breakdowns, and sourcing recommendations.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/15 via-transparent to-transparent" />
              <div className="relative space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">{item.label}</p>
                <p className="text-3xl font-semibold text-[#181B31]">{item.value}</p>
                <p className="text-xs text-[#4B5563]">{item.helper}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 shadow-card-soft">
              <div className="flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] p-1">
                <button
                  type="button"
                  onClick={() => setSortBy('score')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    sortBy === 'score'
                      ? 'bg-[#3D64FF]/20 text-[#3D64FF]'
                      : 'text-[#4B5563] hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]'
                  }`}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Score
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('name')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    sortBy === 'name'
                      ? 'bg-[#3D64FF]/20 text-[#3D64FF]'
                      : 'text-[#4B5563] hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]'
                  }`}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Name
                </button>
              </div>
              <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-sm text-[#4B5563] shadow-inner">
                <Filter className="h-4 w-4 text-[#3D64FF]" />
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  placeholder="Filter skills"
                  className="flex-1 bg-transparent text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
                <ScrollText className="h-4 w-4 text-[#3D64FF]" />
                View audit log
              </button>
            </div>

            <ul className="space-y-4">
              {shortlisted.map((candidate) => {
                const isExpanded = expandedCandidateId === candidate.id;
                const missingSkills = candidate.skillGap.required.filter(
                  (skill) => !candidate.skillGap.present.includes(skill),
                );
                const rankingIndex = shortlisted.findIndex((item) => item.id === candidate.id) + 1;

                return (
                  <li
                    key={candidate.id}
                    className="overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft"
                  >
                    <button
                      type="button"
                      className="w-full space-y-4 px-6 py-5 text-left transition hover:bg-[#3D64FF]/15"
                      onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[#181B31]">{candidate.name}</p>
                          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8A94A6]">
                            {candidate.experience}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-sm font-semibold text-success-700">
                            <Star className="h-4 w-4 text-success-400" />
                            {candidate.matchScore}%
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1 text-xs text-[#4B5563]">
                            Ranked {rankingIndex}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-[#4B5563]">
                        {candidate.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-1 font-medium text-[#3D64FF]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-5 border-t border-[#DCE0E0] bg-[#FFFFFF] px-6 py-5 text-sm text-[#181B31]">
                        <p>{candidate.summary}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Strengths</p>
                            <ul className="mt-3 space-y-2 text-sm">
                              {candidate.skillGap.present.map((skill) => (
                                <li key={skill} className="flex items-center gap-2 text-[#3D64FF]">
                                  <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                              Opportunity areas
                            </p>
                            <ul className="mt-3 space-y-2 text-sm">
                              {missingSkills.length > 0 ? (
                                missingSkills.map((skill) => (
                                  <li key={skill} className="flex items-center gap-2 text-[#3D64FF]">
                                    <Filter className="h-4 w-4 text-[#3D64FF]" />
                                    {skill}
                                  </li>
                                ))
                              ) : (
                                <li className="text-[#8A94A6]">No gaps detected for required skills.</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-sm text-[#181B31]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                            CV highlights
                          </p>
                          <p className="mt-2 leading-relaxed text-[#4B5563]">{candidate.cvText}</p>
                          <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
                            <ScrollText className="h-4 w-4 text-[#3D64FF]" />
                            Open full CV
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="space-y-6">
            <div className="space-y-5 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Processing summary</h3>
              <div className="space-y-3 text-sm text-[#4B5563]">
                <p>
                  <span className="font-semibold text-[#181B31]">Top match:</span>{' '}
                  {topCandidate ? `${topCandidate.name} - ${topCandidate.matchScore}%` : 'Pending'}
                </p>
                <p>
                  <span className="font-semibold text-[#181B31]">Skill coverage:</span>{' '}
                  {averageCoverage !== null ? `${averageCoverage}%` : '--'} average across shortlist
                </p>
                <p>
                  <span className="font-semibold text-[#181B31]">Filtering:</span> Sorted by{' '}
                  {sortBy === 'score' ? 'match score' : 'candidate name'}
                  {skillFilter ? ` - Filtered on "${skillFilter}"` : ' - No skill filter applied'}
                </p>
              </div>
            </div>
            <div className="space-y-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Core skill blueprint</h3>
              <ul className="space-y-3 text-sm text-[#4B5563]">
                {requiredSkills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-3 rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2"
                  >
                    <Star className="h-4 w-4 text-[#3D64FF]" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Next steps</h3>
              <p className="text-sm text-[#4B5563]">
                Share the shortlist with hiring managers or rerun the job with refined weighting to surface alternative
                profiles.
              </p>
              <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wide">
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
                  <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  Rerun with new weights
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
                  <FileBarChart className="h-4 w-4 text-[#3D64FF]" />
                  Share analytics
                </button>
              </div>
            </div>
          </aside>
        </section>
    </div>
  );
}
