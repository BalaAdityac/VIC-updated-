# VIC Company Recruiter Backend

## Stable recruiter workflow

`Company -> Internship -> Student Application -> Candidate Review -> Shortlist/Reject -> Interview -> Reschedule -> Evaluation -> Selected/Rejected`

Stack: Express, PostgreSQL, Prisma 6.19.3, JWT, Zod.

### API groups

- `POST /api/auth/register` and `POST /api/auth/login`
- Company: `/api/company/*`
- Student applications: `/api/student/applications`
- Student apply: `/api/student/internships/:internshipId/apply`
- Student interviews: `/api/student/interviews`
- Company interviews: `/api/company/interviews/*`
- Company evaluations: `/api/company/interviews/:interviewId/evaluation`

### Authorization rules

- `COMPANY` tokens are required for recruiter endpoints.
- Every company-owned resource is resolved through `Company.userId` and the internship/application relationship; another company receives `404` for resources it does not own.
- `STUDENT` tokens are required for student endpoints and can only see their own applications/interviews.
- Student responses never expose internal `Evaluation` records.
- Invalid/expired JWTs return `401`; wrong roles return `403`.

### Application status

`APPLIED -> UNDER_REVIEW -> SHORTLISTED -> SELECTED/REJECTED`

Rejected and selected applications are terminal. A company cannot reopen a rejected application through the status API.

### Interview status

- `SCHEDULED` after initial scheduling
- `RESCHEDULED` after a valid reschedule
- `COMPLETED` when an evaluation is recorded
- `CANCELLED` / `NO_SHOW` are reserved for future operational actions

Only one interview can exist per application. Use the reschedule endpoint instead of creating a second interview.

### Evaluation behavior

`PUT /api/company/interviews/:interviewId/evaluation` is an upsert. It stores/updates the evaluation, marks the interview `COMPLETED`, and synchronizes the application result:

- `HOLD` keeps the application status unchanged.
- `SELECTED` sets the application to `SELECTED`.
- `REJECTED` sets the application to `REJECTED`.

### Database migration

After pulling the branch:

```powershell
npm install
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate dev
```

The recruiter stabilization migration adds `InterviewStatus`, the interview status column, and a unique constraint so duplicate interview scheduling is prevented at the database level.

### Start

```powershell
npm run dev
```

Health: `GET http://localhost:5000/health`

### Real-database integration test

Start PostgreSQL and the API, then run:

```powershell
node scripts/integration-test.js
```

The test creates temporary real records and verifies:

- company creates internship
- student applies
- duplicate application returns `409`
- company sees applications/candidate
- another company cannot access the candidate/interview/evaluation
- application status reaches the student portal
- interview scheduling and all details reach the student portal
- duplicate interview scheduling returns `409`
- rescheduling updates date/time/details and status
- evaluation upsert works for `HOLD` and final `SELECTED`
- final `SELECTED` result reaches the student portal
- rejected candidates cannot be scheduled
- invalid application IDs return `404`
- missing interview details fail validation
- invalid JWT returns `401`

### Postman

Import:

`postman/VIC-Recruiter-Workflow.postman_collection.json`

The collection contains positive workflow tests and negative authorization/validation tests.

## Super Admin module

The backend now includes a Super Admin module under `/api/admin`. It reuses the existing JWT login and role authorization system. See `docs/SUPER_ADMIN_API.md` and `RUN_SUPER_ADMIN.txt` for setup, migration, endpoints, Postman testing and security checks.
