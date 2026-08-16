# VIC Company Applications & Interview Module

## Deliverables
- Company applications list scoped to authenticated company
- Candidate profile view: profile, education, projects, skills and resume reference
- Application status: APPLIED / UNDER_REVIEW / SHORTLISTED / REJECTED
- Interview scheduling only for shortlisted applications
- Company interview list/details
- Student interview list/details
- Company ownership authorization
- Postman collection

## Important source gap
The supplied backend ZIP did not contain the previously described Company Registration or Job/Internship modules. This phase therefore includes minimal `Company` and `Internship` models/routes so the recruiter flow can be run end-to-end. If the teammate's existing Company/Job implementation is merged later, reconcile duplicate models/routes before migration.

## Run
1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name company_applications_interviews`
5. `npm run dev`

## Recruiter flow
1. Company logs in and gets a JWT.
2. Company profile is linked by `Company.userId`.
3. Internships are linked by `Internship.companyId`.
4. `GET /api/applications/company` only returns applications whose internship belongs to that company.
5. `GET /api/applications/company/:id` exposes the candidate review data.
6. `PATCH /api/applications/company/:id/status` changes status.
7. Only `SHORTLISTED` applications can create interviews.
8. Interview records store `companyId`, `studentId`, and `applicationId`.
9. Students can retrieve only their own interviews.

## API endpoints

### Company
- GET `/api/company/profile`
- POST `/api/company/profile`

### Internships
- POST `/api/internships`
- GET `/api/internships`
- GET `/api/internships/:id`

### Applications
- GET `/api/applications/company?page=1&limit=10`
- GET `/api/applications/company/:id`
- PATCH `/api/applications/company/:id/status`
- GET `/api/applications/student`

### Interviews
- POST `/api/interviews`
- GET `/api/interviews/company`
- GET `/api/interviews/company/:id`
- GET `/api/interviews/student`
- GET `/api/interviews/student/:id`

## Interview body
```json
{
  "applicationId": "APPLICATION_UUID",
  "dateTime": "2026-08-20T10:30:00.000Z",
  "meetingLink": "https://meet.example.com/abc",
  "type": "ONLINE",
  "round": "TECHNICAL",
  "notes": "Technical discussion"
}
```

## Status body
```json
{ "status": "SHORTLISTED" }
```
