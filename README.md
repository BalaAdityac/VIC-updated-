<<<<<<< HEAD
# VIC Company Recruiter Backend

Workflow:
Company -> Internship -> Application -> Candidate Profile -> Shortlist/Reject -> Interview -> Evaluation -> Selected/Rejected

Stack: Express, PostgreSQL, Prisma 6.19.3, JWT, Zod.

## Setup

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npx prisma validate
npx prisma generate
npx prisma migrate dev --name recruiter_workflow
npm run dev
```

Health: GET http://localhost:5000/health

Company APIs are scoped through Internship -> Company ownership. Students can retrieve their interview details but cannot retrieve internal evaluations.
=======
# VIC Project — Consolidated Workspace

This folder merges the **latest, most complete version** of every piece you uploaded into one
place, so you can run the whole system from a single location instead of six separate zips.

```
VIC_Project/
├── backend/          ← VIC_company_recruiter_backend_stabilized (most complete backend)
├── student-portal/   ← VIC_student_dashboard_login (dashboard + login, supersedes plain dashboard)
└── company-portal/   ← VIC_company_portal (company-side Next.js app)
```

## Which source zip each folder came from, and why

| Folder | Source zip used | Why this one |
|---|---|---|
| `backend/` | `VIC_company_recruiter_backend_stabilized.zip` | Newest backend. Contains everything `VIC_company_recruiter_backend.zip` has, **plus** the `InterviewStatus` enum, the unique `Interview.applicationId` constraint, `scripts/integration-test.js`, and `INTEGRATION_BUGS_FIXED.md`. `VIC_company_applications_interviews_phase.zip` was an **earlier, separate iteration** (different controller/route naming) that was already superseded once its features were folded into this schema — it was not merged in to avoid reintroducing duplicate/conflicting code. |
| `student-portal/` | `VIC_student_dashboard_login.zip` | Identical `dashboard/page.tsx` and `lib/api.ts` to `VIC_student_dashboard.zip`, but additionally includes `app/login/page.tsx` and redirects `/` → `/login` instead of straight to `/dashboard`. Strict superset, so the plain `student_dashboard` zip was dropped. |
| `company-portal/` | `VIC_company_portal.zip` | Only company-side frontend provided. |

---

## ⚠️ One thing this folder **cannot** fix for you

Per your status notes, the real Postgres database (`vic_db`) already has these migrations applied:

```
20260806150106_init_database
20260806151033_add_student_tables
20260814120000_recruiter_workflow
```

**None of the six zips you uploaded contain the actual `migration.sql` files for those three.**
Only a placeholder `prisma/migrations/README.txt` and the final
`20260814150000_stabilize_recruiter_workflow` migration were present. I have **not** fabricated
the missing migration files — doing so risks creating a migration history that doesn't match your
real database and corrupting it.

Before running `prisma migrate dev`, do this on your dev machine (where `vic_db` actually lives):

```powershell
npx prisma migrate status
```

- If it reports the database already has those 3 migrations applied and just needs
  `20260814150000_stabilize_recruiter_workflow`, you're fine — `npx prisma migrate dev` will only
  apply the new one.
- If it complains about missing migration folders it can't reconcile, use
  `npx prisma migrate resolve --applied <name>` for each of the three already-applied migrations
  (do **not** mark the stabilize one as applied — let it actually run), then re-check status.
- As a last resort, `npx prisma db pull` + `npx prisma migrate diff` can reconstruct a migration
  from the live schema — safer than guessing.

Everything else below is ready to run as-is.

---

## ✅ Completed

- PostgreSQL + Prisma ORM foundation, UUID relational schema, full model set (`User`,
  `StudentProfile`, `Education`, `Project`, `Skill`, `UserSkill`, `Company`, `Internship`,
  `Application`, `Interview`, `Evaluation`)
- Auth: registration, login, password hashing, JWT, role-based middleware
- Student backend: profile, education, projects, skills, self-scoped access
- Company/recruiter backend: internship creation, application management, candidate access,
  shortlist/reject, interview scheduling + reschedule, evaluation (upsert → marks interview
  `COMPLETED`, syncs application result)
- Recruiter workflow stabilization migration (`InterviewStatus` enum, unique constraint on
  `Interview.applicationId`)
- Git merge of recruiter workflow into `sukruthi` branch, pushed to GitHub
- Postman collection (`postman/VIC-Recruiter-Workflow.postman_collection.json`) with positive +
  negative tests
- Backend health check (`GET /health`) previously verified working
- `scripts/integration-test.js` written, covering the full workflow + negative/security cases
  (see list in `backend/INTEGRATION_BUGS_FIXED.md`)
- Student login page added to the student portal

## 🟡 Remaining

1. **Get the backend running again** — start it from `backend/`, confirm `GET /health`.
2. **Verify the Prisma migration history** against the real database (see warning above) — do
   this *before* running `migrate dev` blindly.
3. **Run the full Postman workflow** end-to-end: Register Company A → Login → Create Internship →
   Register/Login Student A → Apply → Company views applications/candidate → Shortlist →
   Schedule Interview → Student views interview → Evaluation → Student checks final status.
   Alternatively run `npm run test:integration` in `backend/`, which automates this.
4. **Security/negative testing** — duplicate applications, cross-company access, invalid IDs,
   missing required fields, unauthorized evaluation access, etc. (full table in
   `backend/INTEGRATION_BUGS_FIXED.md`).
5. **Student Portal integration with real DB data** (no mock data) — `student-portal/` already
   points at `NEXT_PUBLIC_API_URL`; confirm every screen (application status, interview details,
   final result) is pulling from the live backend once it's running.
6. Fix any critical bugs found during 3–5, then you're ready for the client demo.

---

## How to run everything

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit DATABASE_URL / JWT_SECRET
npm install
npx prisma validate
npx prisma generate
npx prisma migrate status   # ⚠️ read the warning above before the next line
npx prisma migrate dev
npm run dev
```

Verify: `http://localhost:5000/health` → `{"success":true,"message":"VIC backend is running"}`

Run the automated integration test (in a second terminal, backend still running):

```bash
cd backend
npm run test:integration
```

Expected last line: `ALL INTEGRATION TESTS PASSED`

Import Postman collection: `backend/postman/VIC-Recruiter-Workflow.postman_collection.json`

### 2. Student Portal

```bash
cd student-portal
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

### 3. Company Portal

```bash
cd company-portal
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

> Note the trailing `/api` differs between the two frontends' env files — that's intentional,
> copied exactly from each project's own example file. Don't "fix" one to match the other without
> checking how each app's `lib/api.ts` / fetch calls use the base URL.

### Suggested run order

Backend first (and confirm `/health`) → Company Portal → Student Portal, so there's data in the
system (a registered company + internship) before the student side tries to display anything.
>>>>>>> 969407556b3a237f3d2a4e8b87d1649538ce395d
