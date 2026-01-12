import { z } from "zod";

export const jobPromptFields = [
  {
    key: "title",
    label: "Job title",
    placeholder: "e.g. Senior Backend Engineer",
  },
  {
    key: "responsibilities",
    label: "Key responsibilities",
    placeholder: "List each responsibility on a new line.",
    type: "textarea",
  },
  {
    key: "skills",
    label: "Required skills",
    placeholder: "Comma separated list of must-have skills.",
    type: "textarea",
  },
  {
    key: "experienceLevel",
    label: "Experience level",
    placeholder: "",
    type: "select",
  },
  {
    key: "companyCulture",
    label: "Culture & environment",
    placeholder: "Describe what makes the team unique and how you work together.",
    type: "textarea",
  },
] as const;

export type JobPromptFieldKey = (typeof jobPromptFields)[number]["key"];

export const jobPromptRequiredKeys: JobPromptFieldKey[] = ["title", "skills", "experienceLevel"];
export const jobPromptSkippableKeys: JobPromptFieldKey[] = ["responsibilities", "companyCulture"];

export const jobPromptSchemas: Record<JobPromptFieldKey, z.ZodTypeAny> = {
  title: z.string().trim().min(3, "Job title is required"),
  responsibilities: z.string().trim().optional().or(z.literal("")),
  skills: z.string().trim().min(3, "Required skills are required"),
  experienceLevel: z.string().trim().min(2, "Experience level is required"),
  companyCulture: z.string().trim().optional().or(z.literal("")),
};

export const fallbackExperienceOptions = ["Entry level", "Mid-level", "Senior", "Lead", "Director"] as const;
export const fallbackEmploymentTypeOptions = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"] as const;
export const fallbackCurrencyOptions = ["BDT", "USD", "YEN"] as const;
