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
