export interface Job {
  id: string;
  title: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedCount?: number;
  totalCount?: number;
}

export interface Candidate {
  id: string;
  name: string;
  matchScore: number;
  matchedSkills: string[];
  email?: string;
  phone?: string;
  experience?: string;
  education?: string;
  summary?: string;
  skillGap: {
    required: string[];
    present: string[];
  };
  cvText?: string;
  shortlisted?: boolean;
}

export interface JobDescription {
  title: string;
  responsibilities: string[];
  skills: string[];
  experienceLevel: string;
  companyCulture: string;
}