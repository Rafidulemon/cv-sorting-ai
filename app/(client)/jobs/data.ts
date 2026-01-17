export type SortingState = 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED';

export type ApiJob = {
  id: string;
  title: string;
  status: string;
  sortingState: SortingState;
  cvSortedCount?: number | null;
  cvAnalyzedCount?: number | null;
  sortingRuns?: number | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  lastActivityAt?: string | Date | null;
  createdBy?: { id?: string | null; name?: string | null; email?: string | null } | null;
  seniority?: string | null;
  locations?: string[] | null;
  requirements?: Record<string, unknown> | null;
  description?: string | null;
  previewHtml?: string | null;
};

export type JobSummary = {
  id: string;
  title: string;
  status: string;
  candidates: number;
  shortlist: number;
  owner: string;
  created: string;
  updated: string;
  sortingState: SortingState;
  lastSorted?: string;
};

export type JobDetail = JobSummary & {
  seniority?: string;
  description?: string | null;
  requirements?: string[];
  location?: string;
};

const formatRelative = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
};

const humanizeStatus = (status?: string | null) => {
  if (!status) return 'Draft';
  const lower = status.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const mapSortingState = (state?: string | null): SortingState => {
  if (!state) return 'NOT_STARTED';
  const normalized = state.toUpperCase() as SortingState;
  if (normalized === 'PROCESSING' || normalized === 'COMPLETED') return normalized;
  return 'NOT_STARTED';
};

export function mapJobToSummary(job: ApiJob): JobSummary {
  return {
    id: job.id,
    title: job.title,
    status: humanizeStatus(job.status),
    candidates: job.cvAnalyzedCount ?? 0,
    shortlist: job.cvSortedCount ?? 0,
    owner: job.createdBy?.name || job.createdBy?.email || 'Unknown',
    created: formatRelative(job.createdAt),
    updated: formatRelative(job.updatedAt),
    sortingState: mapSortingState(job.sortingState),
    lastSorted: formatRelative(job.lastActivityAt),
  };
}

export function mapJobToDetail(job: ApiJob): JobDetail {
  const summary = mapJobToSummary(job);
  const requirements =
    job.requirements && typeof job.requirements === 'object' && !Array.isArray(job.requirements)
      ? (job.requirements as Record<string, unknown>)
      : null;

  return {
    ...summary,
    seniority: job.seniority || undefined,
    description: job.description || job.previewHtml || null,
    requirements: Array.isArray(requirements?.responsibilities)
      ? (requirements?.responsibilities as string[])
      : Array.isArray(requirements?.skills)
        ? (requirements?.skills as string[])
        : undefined,
    location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations ?? undefined,
  };
}
