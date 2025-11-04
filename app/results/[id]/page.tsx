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
import Layout from '../../components/Layout';
import type { Candidate } from '../../types';

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

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-gray-900">
              Results • {jobId ? decodeURIComponent(jobId) : 'Unknown job'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Processed 47 CVs. Showing top matches ranked by overall fit score. Adjust filters to refine the shortlist.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </button>
            <button className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Processed CVs</p>
              <FileBarChart className="h-4 w-4 text-primary-600" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">47</p>
            <p className="text-xs text-gray-500">10 shortlisted for review</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Average match score</p>
              <Sparkles className="h-4 w-4 text-primary-600" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">84%</p>
            <p className="text-xs text-gray-500">Top candidate scored 92%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Role readiness</p>
              <Star className="h-4 w-4 text-primary-600" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{shortlisted.length} shortlisted</p>
            <p className="text-xs text-gray-500">Focus on candidates flagged green</p>
          </div>
        </section>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Candidate matches</h2>
              <p className="text-sm text-gray-500">Sortable list with match score and key skill alignment.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Filter by skill (e.g. Django)"
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  className="w-48 border-none p-0 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                <ArrowUpDown className="mr-2 h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as 'score' | 'name')}
                  className="border-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                >
                  <option value="score">Sort by score</option>
                  <option value="name">Sort by name</option>
                </select>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => {
              const isExpanded = expandedCandidateId === candidate.id;
              return (
                <li key={candidate.id} className="px-6 py-5 transition hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                    className="flex w-full flex-col gap-4 text-left md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-base font-semibold text-gray-900">{candidate.name}</p>
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                          Match {candidate.matchScore}%
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{candidate.experience}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {candidate.matchedSkills.map((skill) => (
                          <span key={skill} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary-600">
                      <span>{isExpanded ? 'Hide insights' : 'See why matched'}</span>
                      <ScrollText className="h-4 w-4" />
                    </div>
                  </button>

                  {isExpanded && candidate.summary && (
                    <div className="mt-5 space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <div className="grid gap-6 lg:grid-cols-5">
                        <div className="space-y-4 lg:col-span-3">
                          <div className="rounded-lg bg-white p-4 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                              <Sparkles className="h-4 w-4" />
                              AI Generated Summary
                            </h3>
                            <p className="mt-2 text-sm text-gray-700">{candidate.summary}</p>
                          </div>
                          {candidate.skillGap && (
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                                <Filter className="h-4 w-4" />
                                Skill Gap Analysis
                              </h3>
                              <div className="mt-4 space-y-3">
                                {requiredSkills.map((skill) => {
                                  const hasSkill = candidate.skillGap?.present.includes(skill);
                                  return (
                                    <div key={skill} className="flex items-center justify-between text-sm text-gray-700">
                                      <span>{skill}</span>
                                      <span className={`text-xs font-medium ${hasSkill ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {hasSkill ? 'Present' : 'Gap'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="lg:col-span-2">
                          <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                              <FileText className="h-4 w-4" />
                              Extracted CV Text
                            </h3>
                            <p className="mt-2 flex-1 text-sm text-gray-600">{candidate.cvText}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-3">
                        <button className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                          <Download className="mr-2 h-4 w-4" />
                          Export to PDF
                        </button>
                        <button className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                          <FileText className="mr-2 h-4 w-4" />
                          Export to Excel
                        </button>
                        <button className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
                          Shortlist candidate
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
