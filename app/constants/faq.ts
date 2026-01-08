import { FAQ } from "../types/faq";

export const FAQS: FAQ[] = [
  {
    id: "gs-1",
    category: "Getting Started",
    question: "What is carriX?",
    answer:
      "carriX is an AI-powered resume screening and hiring platform that helps you evaluate candidates faster by scoring, ranking, and shortlisting resumes against your job criteria.",
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "How do I start screening resumes?",
    answer:
      "Create a job by pasting a job description, upload candidate CVs, and let carriX generate criteria and scores. You can edit criteria anytime to match your hiring needs.",
  },
  {
    id: "prod-1",
    category: "Product",
    question: "Can I customize the screening criteria?",
    answer:
      "Yes. carriX can suggest criteria automatically, and you can add, remove, reweight, or rewrite requirements to reflect your exact role needs.",
  },
  {
    id: "prod-2",
    category: "Product",
    question: "Does carriX explain why a candidate scored higher?",
    answer:
      "Yes. carriX provides transparent, explainable scoring with key signals and rationale so you can trust decisions and audit outcomes.",
  },
  {
    id: "price-1",
    category: "Pricing",
    question: "Do you offer annual billing discounts?",
    answer:
      "Yes. Annual plans are discounted (up to 20%). You can also choose month-to-month billing on paid tiers.",
  },
  {
    id: "price-2",
    category: "Pricing",
    question: "What counts as a resume credit?",
    answer:
      "Each candidate resume/CV analyzed by carriX counts as one resume credit.",
  },
  {
    id: "price-3",
    category: "Pricing",
    question: "Can I add more resume credits?",
    answer:
      "Yes. You can purchase additional credits anytime. Higher tiers also include lower per-resume pricing.",
  },
  {
    id: "sec-1",
    category: "Security",
    question: "Is my data secure?",
    answer:
      "We use modern security best practices including encryption in transit and at rest, strict access controls, and least-privilege policies. If you need custom requirements, contact us.",
  },
  {
    id: "sec-2",
    category: "Security",
    question: "Do you store uploaded resumes?",
    answer:
      "You control your data. By default, resumes are stored only as needed to provide the service and improve your workflow. For stricter retention policies, we can support custom settings.",
  },
  {
    id: "int-1",
    category: "Integrations",
    question: "Do you integrate with ATS tools?",
    answer:
      "Integrations are on the roadmap. If you need a specific ATS integration, contact sales. We prioritize based on demand.",
  },
  {
    id: "int-2",
    category: "Integrations",
    question: "Do you have an API?",
    answer:
      "Yes. API access is available on paid plans so you can automate screening and connect carriX to your internal tools.",
  },
];

export const FAQ_CATEGORIES: Array<FAQ["category"] | "All"> = [
  "All",
  "Getting Started",
  "Product",
  "Pricing",
  "Security",
  "Integrations",
];
