import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Building2,
  Cable,
  CreditCard,
  FileText,
  Flag,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Mail,
  Receipt,
  ScrollText,
  Settings,
  Users,
  Users2,
} from "lucide-react";

export type AdminNavChild = {
  label: string;
  href: string;
};

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: AdminNavChild[];
};

export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavSections: AdminNavSection[] = [
  {
    label: "Dashboard",
    items: [{ label: "Overview", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Tenants",
    items: [
      { label: "Workspaces", href: "/admin/workspaces", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
      {
        label: "Failed Documents",
        href: "/admin/failed-documents",
        icon: AlertTriangle,
        badge: "Triage",
      },
    ],
  },
  {
    label: "AI & Quality",
    items: [
      { label: "Models & Prompts", href: "/admin/models", icon: BrainCircuit },
      { label: "Usage & Spend", href: "/admin/usage", icon: Gauge },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        label: "Plans & Entitlements",
        href: "/admin/plans",
        icon: Layers,
      },
      { label: "Invoices", href: "/admin/invoices", icon: Receipt },
      {
        label: "Payments & Credits",
        href: "/admin/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Content & Site",
    items: [
      {
        label: "Site Content",
        href: "/admin/content",
        icon: FileText,
        children: [
          { label: "All pages", href: "/admin/content/pages" },
          { label: "Home & Marketing copy", href: "/admin/content/home" },
          { label: "Features & Pricing", href: "/admin/content/pricing" },
          { label: "About & Contact", href: "/admin/content/contact" },
        ],
      },
      {
        label: "Blog",
        href: "/admin/blog",
        icon: BookOpen,
        children: [
          { label: "Posts", href: "/admin/blog/posts" },
          { label: "New post", href: "/admin/blog/new" },
        ],
      },
      {
        label: "Legal",
        href: "/admin/legal",
        icon: ScrollText,
        children: [
          { label: "Privacy Policy", href: "/admin/legal/privacy" },
          { label: "Terms & Conditions", href: "/admin/legal/terms" },
          { label: "Cookies", href: "/admin/legal/cookies" },
        ],
      },
      {
        label: "Contact & Footer",
        href: "/admin/contact",
        icon: Mail,
        children: [
          { label: "Contact info", href: "/admin/contact/info" },
          { label: "Footer links", href: "/admin/contact/footer" },
        ],
      },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      {
        label: "Compliance & Retention",
        href: "/admin/compliance",
        icon: BadgeCheck,
      },
      {
        label: "API Keys & Webhooks",
        href: "/admin/integrations",
        icon: Cable,
      },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
      { label: "Impersonation Logs", href: "/admin/impersonation", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
      { label: "System Settings", href: "/admin/settings", icon: Settings },
      { label: "Status / Health", href: "/admin/status", icon: HeartPulse },
    ],
  },
];

export const adminNavItems = adminNavSections.flatMap((section) => section.items);

export const getAdminNavItem = (pathname: string): AdminNavItem | undefined => {
  const normalized = pathname.replace(/\/$/, "") || "/";

  return adminNavItems.find((item) => {
    if (item.href === "/admin") {
      return normalized === "/admin";
    }

    return normalized === item.href || normalized.startsWith(`${item.href}/`);
  });
};
