import type { Candidate } from '@/app/types';

export type CandidateStage = 'shortlist' | 'hold' | 'rejected';

export type CandidateResult = Candidate & {
  stage: CandidateStage;
  experience: string;
  summary: string;
  cvText: string;
};

export const requiredSkills = ['Python', 'Django', 'AWS', 'REST APIs', 'Team Leadership'];

export const stageMeta: Record<CandidateStage, { label: string; className: string }> = {
  shortlist: { label: 'Shortlisted', className: 'bg-[#E6F4EA] text-[#1B806A]' },
  hold: { label: 'On hold', className: 'bg-[#FFF5E5] text-[#9A5B00]' },
  rejected: { label: 'Rejected', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
};

export const candidateResults: CandidateResult[] = [
  {
    id: 'cand-001',
    stage: 'shortlist',
    name: 'Avery Johnson',
    matchScore: 92,
    matchedSkills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
    experience: '6 years | TechNova Labs',
    summary: 'Senior backend engineer delivering scalable APIs and distributed systems with a focus on reliability.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'Django', 'AWS', 'REST APIs'],
    },
    cvText:
      'Lead backend development for AI-driven analytics platform, architected microservices with Python and Django. Managed cloud infrastructure on AWS (ECS, Lambda, RDS)...',
  },
  {
    id: 'cand-002',
    stage: 'shortlist',
    name: 'Jordan Patel',
    matchScore: 88,
    matchedSkills: ['Python', 'FastAPI', 'Kafka', 'CI/CD'],
    experience: '5 years | Orbit Systems',
    summary:
      'Built low-latency data pipelines and modernized CI/CD workflows. Experience mentoring junior engineers.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'FastAPI', 'CI/CD', 'REST APIs'],
    },
    cvText:
      'Engineering lead for event-driven services with FastAPI and Kafka. Implemented automation suite with GitHub Actions, Terraform on AWS...',
  },
  {
    id: 'cand-003',
    stage: 'shortlist',
    name: 'Emilia Chen',
    matchScore: 83,
    matchedSkills: ['Python', 'Django', 'GraphQL', 'People Management'],
    experience: '7 years | Northwind Tech',
    summary:
      'Managed a team of 5 engineers building subscription commerce tooling. Strong focus on cross-team collaboration.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'Django', 'Team Leadership', 'GraphQL'],
    },
    cvText:
      'Directed roadmap delivery for subscription billing platform. Introduced OKR process and improved on-call reliability metrics...',
  },
  {
    id: 'cand-004',
    stage: 'shortlist',
    name: 'Noah Murphy',
    matchScore: 76,
    matchedSkills: ['Python', 'Serverless', 'AWS', 'Monitoring'],
    experience: '4 years | Skyward Analytics',
    summary:
      'Full-stack engineer specialising in serverless architectures and observability tooling.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'AWS', 'Serverless', 'Monitoring'],
    },
    cvText:
      'Designed telemetry pipelines with AWS Lambda and Kinesis. Delivered customer dashboards in React with robust alerting integrations...',
  },
  {
    id: 'cand-005',
    stage: 'hold',
    name: 'Priya Das',
    matchScore: 71,
    matchedSkills: ['Python', 'Flask', 'GCP', 'BigQuery'],
    experience: '5 years | DataLift',
    summary: 'Backend engineer with data focus; ships ETL services and analytics APIs for product teams.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'REST APIs', 'GCP'],
    },
    cvText: 'Built ingestion services in Flask, automated data quality checks, partnered with analysts on dashboards...',
  },
  {
    id: 'cand-006',
    stage: 'hold',
    name: 'Miguel Santos',
    matchScore: 69,
    matchedSkills: ['Python', 'Django', 'Azure', 'Event-Driven'],
    experience: '6 years | Horizon Retail',
    summary: 'Owns core services for order and payments; led migration to async messaging on Azure.',
    skillGap: {
      required: requiredSkills,
      present: ['Python', 'Django', 'REST APIs'],
    },
    cvText:
      'Implemented CQRS design for order management, improved API latency by 30%, and mentored two junior engineers...',
  },
  {
    id: 'cand-007',
    stage: 'rejected',
    name: 'Lena Fischer',
    matchScore: 55,
    matchedSkills: ['Java', 'Spring', 'MySQL'],
    experience: '8 years | Alpine Systems',
    summary: 'Seasoned backend engineer with Java focus; limited Python exposure.',
    skillGap: {
      required: requiredSkills,
      present: ['REST APIs'],
    },
    cvText: 'Maintained Spring-based APIs, led database optimisations, and introduced code quality gates...',
  },
  {
    id: 'cand-008',
    stage: 'rejected',
    name: 'Kai Nakamura',
    matchScore: 49,
    matchedSkills: ['Node.js', 'Express', 'MongoDB'],
    experience: '3 years | Bright Labs',
    summary: 'Full-stack developer early in career, no Django experience yet.',
    skillGap: {
      required: requiredSkills,
      present: ['REST APIs'],
    },
    cvText: 'Built CRUD services with Express and MongoDB, implemented simple CI workflows, and supported front-end tickets...',
  },
];
