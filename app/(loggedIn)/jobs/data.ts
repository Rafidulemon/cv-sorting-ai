export type SortingState = 'not_started' | 'processing' | 'completed';

export type JobSummary = {
  id: string;
  title: string;
  status: 'Active' | 'Draft' | 'Reviewing' | 'Completed';
  candidates: number;
  shortlist: number;
  owner: string;
  created: string;
  updated: string;
  sortingState: SortingState;
  lastSorted?: string;
  sortingRuns?: number;
};

export type JobDetail = JobSummary & {
  location: string;
  summary: string;
  requirements: string[];
  metrics: Array<{ label: string; value: string; helper: string }>;
  updates: Array<{ label: string; value: string; tone: 'positive' | 'neutral' }>;
};

export const jobs: JobSummary[] = [
  {
    id: 'job-1042',
    title: 'Senior Backend Engineer',
    status: 'Active',
    candidates: 128,
    shortlist: 25,
    owner: 'Nora Patel',
    created: '2d ago',
    updated: 'Today',
    sortingState: 'completed',
    lastSorted: 'Today, 4:10 PM',
    sortingRuns: 3,
  },
  {
    id: 'job-1043',
    title: 'Product Designer',
    status: 'Draft',
    candidates: 58,
    shortlist: 12,
    owner: 'Leo Martins',
    created: '3d ago',
    updated: 'Yesterday',
    sortingState: 'not_started',
  },
  {
    id: 'job-1044',
    title: 'Sales Development Representative',
    status: 'Reviewing',
    candidates: 92,
    shortlist: 18,
    owner: 'Sienna Yu',
    created: '1w ago',
    updated: '2d ago',
    sortingState: 'processing',
    lastSorted: '2d ago',
    sortingRuns: 1,
  },
  {
    id: 'job-1045',
    title: 'Data Analyst',
    status: 'Active',
    candidates: 74,
    shortlist: 15,
    owner: 'Owen Banks',
    created: '5d ago',
    updated: 'Today',
    sortingState: 'completed',
    lastSorted: 'Today, 11:45 AM',
    sortingRuns: 2,
  },
];

export const jobDetails: Record<string, JobDetail> = {
  'job-1042': {
    id: 'job-1042',
    title: 'Senior Backend Engineer',
    status: 'Active',
    created: 'Mon, 9:12 AM',
    updated: 'Today, 4:10 PM',
    owner: 'Nora Patel',
    location: 'Remote • EU/UK',
    summary:
      'Leading backend services powering candidate ranking. Own API performance, data pipelines, and reliability as we scale sorting to new regions.',
    requirements: [
      '7+ years with backend systems (Node, Go, or Python).',
      'Experience with distributed queues, caching, and observability.',
      'Comfortable partnering with ML engineers on scoring pipelines.',
      'Clear communication and mentorship across squads.',
    ],
    metrics: [
      { label: 'Candidates', value: '128', helper: '47 analysed this week' },
      { label: 'Shortlisted', value: '25', helper: 'Top 20% ready for review' },
      { label: 'Time to fill', value: '32 days', helper: 'Forecast based on pace' },
    ],
    updates: [
      { label: 'JD refined and live', value: 'Completed', tone: 'positive' },
      { label: 'Awaiting final interview loop design', value: 'In review', tone: 'neutral' },
    ],
    candidates: 128,
    shortlist: 25,
    sortingState: 'completed',
    lastSorted: 'Today, 4:10 PM',
    sortingRuns: 3,
  },
  'job-1043': {
    id: 'job-1043',
    title: 'Product Designer',
    status: 'Draft',
    created: 'Sun, 4:40 PM',
    updated: 'Yesterday, 1:10 PM',
    owner: 'Leo Martins',
    location: 'Hybrid • NYC',
    summary:
      'Shape candidate and recruiter surfaces across sorting and insights. Drive end-to-end UX with crisp interaction design.',
    requirements: [
      'Portfolio showing shipped product work.',
      'Strong Figma systems skills and prototyping.',
      'Close collaboration with PM/Eng; comfort with data.',
    ],
    metrics: [
      { label: 'Candidates', value: '58', helper: 'Sourced from last month' },
      { label: 'Shortlisted', value: '12', helper: 'Need new intake to continue' },
      { label: 'Time to fill', value: '—', helper: 'Start intake to forecast' },
    ],
    updates: [{ label: 'JD draft in progress', value: 'Unpublished', tone: 'neutral' }],
    candidates: 58,
    shortlist: 12,
    sortingState: 'not_started',
  },
  'job-1044': {
    id: 'job-1044',
    title: 'Sales Development Representative',
    status: 'Reviewing',
    created: 'Aug 24, 9:30 AM',
    updated: '2d ago',
    owner: 'Sienna Yu',
    location: 'Onsite • Austin, TX',
    summary:
      'Prospect and qualify inbound demand for AI sorting. Build repeatable outbound motions with marketing and AE partners.',
    requirements: [
      'History of exceeding SQL targets.',
      'Comfort with CRM hygiene and fast feedback loops.',
      'Strong written comms for outbound personalization.',
    ],
    metrics: [
      { label: 'Candidates', value: '92', helper: '11 new this week' },
      { label: 'Shortlisted', value: '18', helper: 'Needs hiring manager review' },
      { label: 'Time to fill', value: '19 days', helper: 'Ahead of target' },
    ],
    updates: [
      { label: 'Screening calibration complete', value: 'Complete', tone: 'positive' },
      { label: 'Manager review pending', value: 'Waiting on scheduling', tone: 'neutral' },
    ],
    candidates: 92,
    shortlist: 18,
    sortingState: 'processing',
    lastSorted: '2d ago',
    sortingRuns: 1,
  },
  'job-1045': {
    id: 'job-1045',
    title: 'Data Analyst',
    status: 'Active',
    created: 'Aug 18, 2:00 PM',
    updated: 'Today, 11:45 AM',
    owner: 'Owen Banks',
    location: 'Remote • US',
    summary:
      'Build reporting for CV intake, scoring quality, and recruiter productivity. Define trustworthy dashboards across ops.',
    requirements: [
      '4+ years in analytics or data science.',
      'Proficiency in SQL and a BI tool (Mode, Looker, or Tableau).',
      'Comfort with experimentation and causal analysis.',
    ],
    metrics: [
      { label: 'Candidates', value: '74', helper: 'Steady inflow' },
      { label: 'Shortlisted', value: '15', helper: 'Running a/b evaluation' },
      { label: 'Time to fill', value: '27 days', helper: 'Tracking to plan' },
    ],
    updates: [
      { label: 'JD published', value: 'Live', tone: 'positive' },
      { label: 'Awaiting calibration run', value: 'Queued', tone: 'neutral' },
    ],
    candidates: 74,
    shortlist: 15,
    sortingState: 'completed',
    lastSorted: 'Today, 11:45 AM',
    sortingRuns: 2,
  },
};
