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
- **Freemium** — $0/month  
  - 10 resumes/month  
  - Basic reasoning  
  - Add credits at **$2 per resume**  
  - Seats: 1 company member

- **Standard** — $119/month billed annually (or $149 month-to-month)  
  - 100 resumes/month  
  - 1 company admin seat  
  - API access  
  - Advanced reasoning  
  - Integrations (coming soon)  
  - Advanced analytics (coming soon)  
  - Add credits at **$1.50 per resume**

- **Enterprise** — $239/month billed annually (or $299 month-to-month)  
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

### Backend (NestJS monorepo)
```
carrix-backend/
├── apps/
│   ├── api/       # HTTP API: auth, org, RBAC, jobs, candidates, files, notifications
│   └── worker/    # Queue-driven background processing: OCR, parsing, AI, notifications
├── packages/
│   ├── db/        # Prisma client + schema symlinked from prisma/schema.prisma
│   └── shared/    # DTOs, enums, constants
├── docker/        # docker assets (placeholder)
├── docker-compose.yml
├── tsconfig.base.json
└── nest-cli.json
```

Commands:
```bash
npm run api:dev        # API (watch) on http://localhost:${API_PORT:-4000}/${API_PREFIX:-api}
npm run worker:dev     # Worker (queue-driven) boot with WATCH mode
npm run api:build && npm run api:start
npm run worker:build && npm run worker:start
```

### Database & Prisma
- Set `DATABASE_URL` (pooled Neon) and `DIRECT_URL` (non-pooled) in `.env` before running Prisma commands.
- Useful scripts: `npm run prisma:push` (sync schema to dev DB), `npm run prisma:migrate -- --name <name>` (create migration), `npm run prisma:deploy` (apply in prod), `npm run prisma:studio` (inspect data).
- Vector-related fields (`JobEmbedding.embedding`, `ResumeEmbedding.embedding`) are stored as `float8[]` for Prisma compatibility; enable the `vector` extension and convert them to `vector(1536)` plus IVFFlat/LSH indexes when you’re ready for pgvector-powered search.

### Local development
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### NestJS API (backend)
```bash
npm run nest:dev          # start API with watch mode on http://localhost:4000
npm run nest:build        # emit compiled files to nest/dist
npm run nest:start        # run the built server
```

### Linting
```bash
npm run lint
```

### Authentication (NextAuth)
- Required env vars in `.env`:  
  - `NEXTAUTH_URL=http://localhost:3000`  
  - `NEXTAUTH_SECRET=<generate with openssl rand -base64 32>` (falls back to a dev secret if omitted)
- Optional Google OAuth: set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to enable Google in the same handler.
- Credentials auth uses database users (email + password hash in `User.passwordHash`). Google is added when env vars exist.
- API route: `app/api/auth/[...nextauth]/route.ts` (JWT sessions; credentials provider hitting Prisma, Google optional). Defaults to `/api/auth/*` handled by NextAuth.
Note: some pre-existing lint warnings/errors may remain in client pages/modals; fix before shipping if required by CI.
