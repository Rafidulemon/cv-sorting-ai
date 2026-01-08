import { Sparkles, Users, ShieldCheck, LineChart } from "lucide-react";

export const metrics = [
  { label: "Resumes screened weekly", value: "500k+" },
  { label: "Avg. time saved per role", value: "12 hrs" },
  { label: "Uptime with monitoring", value: "99.9% SLA" },
  { label: "Confidence reports", value: "Explainable by default" },
];

export const pillars = [
  {
    title: "Explainable AI",
    desc: "Clear rationales, bias checks, and audit trails for every score.",
    icon: Sparkles,
  },
  {
    title: "Human-centered",
    desc: "Built for recruiters and hiring managers with comments and handoffs.",
    icon: Users,
  },
  {
    title: "Enterprise-ready",
    desc: "SOC2-aligned practices, RBAC, and SSO on the roadmap.",
    icon: ShieldCheck,
  },
  {
    title: "Outcomes-first",
    desc: "Optimize for time-to-shortlist and candidate experience—not vanity metrics.",
    icon: LineChart,
  },
];

export const timeline = [
  {
    year: "2022",
    title: "We felt the bottleneck",
    desc: "An internal tool to sift engineering candidates quickly evolved into carriX.",
  },
  {
    year: "2023",
    title: "Explainable scoring",
    desc: "We built a transparent scoring engine with rationale and risk signals.",
  },
  {
    year: "2024",
    title: "Launch and scale",
    desc: "Shortlists, collaboration, and exports made carriX the hiring sidekick for teams.",
  },
  {
    year: "Today",
    title: "Hiring, accelerated",
    desc: "Partnering with TA teams to automate high-volume roles responsibly.",
  },
];