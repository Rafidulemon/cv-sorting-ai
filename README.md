## carriX — Product & Business Overview

carriX is a Next.js 16 / React 19 platform that automates CV intake, parsing, and AI-driven scoring so hiring teams can shortlist faster.

### How it works for companies
1) **Create a company**: any owner can sign up and create their company workspace.  
2) **Invite the team**: owners invite members; seat limits depend on the chosen subscription.  
3) **Ingest & process CVs**: upload CVs, create jobs with role criteria, and let carriX handle OCR → extraction → scoring.  
4) **Review & contact**: view ranked candidates, inspect extracted fields, move candidates into shortlist/hold/reject, and send outreach emails directly from the console.  
5) **Ask AI about a candidate**: chat with the candidate’s CV for deeper signals (skills, gaps, fit) and generate follow-up questions or summaries.  
6) **Follow-up & credits**: export shortlists, trigger candidate emails, and top up credits when needed.

### Subscription plans
- **Free** — $0/month  
  - 10 resumes/month  
  - Basic reasoning  
  - Add credits at **$2 per resume**  
  - Seats: 1 owner (solo)

- **Standard** — $119/month billed annually (or $149 month-to-month)  
  - 100 resumes/month  
  - 1 team seat  
  - API access  
  - Advanced reasoning  
  - Integrations (coming soon)  
  - Advanced analytics (coming soon)  
  - Add credits at **$1.50 per resume**

- **Premium** — $239/month billed annually (or $299 month-to-month)  
  - 500 resumes/month  
  - 5 seats  
  - API access  
  - Advanced reasoning  
  - Integrations (coming soon)  
  - Advanced analytics (coming soon)  
  - Add credits at **$1.25 per resume**

### Product pillars
- **Fast ingestion & scoring**: drag-and-drop uploads, job setup, and automated OCR/extraction/scoring pipeline.  
- **Actionable results**: ranked candidates with extracted fields and reasoning signals, plus AI Q&A on each CV.  
- **Governed collaboration**: company owners control who joins; seats tied to plan.  
- **Engage candidates**: send outreach emails from the console to progress shortlists.  
- **Pay for usage**: monthly resume allotments per plan plus per-resume credits when you need more.

### Tech & structure (for engineering)
- **Framework**: Next.js App Router, TypeScript, TailwindCSS v4.  
- **UI**: lucide-react icons, IBM Plex Sans + JetBrains Mono via `next/font`.  
- **Key paths**:  
  - Client console: `app/(client)/` (dashboard, jobs, CV analysis, history, settings, billing/credits).  
  - Admin console: `app/(admin)/admin/` (operational tooling; hidden from end-user flows).  
  - Shared components: `app/components/`.

### Local development
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Linting
```bash
npm run lint
```
Note: some pre-existing lint warnings/errors may remain in client pages/modals; fix before shipping if required by CI.
