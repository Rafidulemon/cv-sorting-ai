import { BlogPost } from "../types/blogPost";

export const POSTS: BlogPost[] = [
  {
    id: "p1",
    title: "Introducing carriX: Next-Gen AI for Hiring",
    excerpt:
      "Meet carriX—resume screening and shortlisting powered by explainable AI. Here’s what it does and why we built it.",
    category: "Company",
    date: "2026-01-01",
    readTime: "4 min read",
    author: "Carriastic Team",
    cover:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/introducing-carrix",
    featured: true,
  },
  {
    id: "p2",
    title: "How AI Resume Screening Works (Without the Hype)",
    excerpt:
      "A practical breakdown of how AI scores resumes, what signals matter, and how to use it responsibly.",
    category: "AI",
    date: "2025-12-20",
    readTime: "6 min read",
    author: "Product Team",
    cover:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/how-ai-resume-screening-works",
  },
  {
    id: "p3",
    title: "Hiring at Scale: Building Consistent Criteria",
    excerpt:
      "Why consistent rubrics matter and how to create criteria that improve quality while reducing screening time.",
    category: "Hiring",
    date: "2025-12-12",
    readTime: "5 min read",
    author: "Talent Ops",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/consistent-criteria",
  },
  {
    id: "p4",
    title: "From Keywords to Context: Smarter Candidate Matching",
    excerpt:
      "Keyword matching misses strong candidates. Here’s how context-based scoring surfaces better fits.",
    category: "Product",
    date: "2025-11-28",
    readTime: "7 min read",
    author: "Engineering",
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/keywords-to-context",
  },
  {
    id: "p5",
    title: "Recruiter Playbook: Shortlisting in 15 Minutes",
    excerpt:
      "A step-by-step workflow to go from JD to shortlist, including what to review before interviews.",
    category: "Guides",
    date: "2025-11-05",
    readTime: "8 min read",
    author: "Growth",
    cover:
      "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/shortlisting-playbook",
  },
  {
    id: "p6",
    title: "Responsible Hiring AI: Transparency & Fairness",
    excerpt:
      "What to look for in hiring AI tools—explanations, consistent rubrics, and human oversight.",
    category: "AI",
    date: "2025-10-18",
    readTime: "6 min read",
    author: "Carriastic Team",
    cover:
      "https://images.unsplash.com/photo-1526378722445-0d4e4f4fb0a8?auto=format&fit=crop&w=1600&q=80",
    href: "/blog/responsible-hiring-ai",
  },
];

export const CATEGORIES: Array<BlogPost["category"] | "All"> = [
  "All",
  "Product",
  "Hiring",
  "AI",
  "Guides",
  "Company",
];