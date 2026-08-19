# Recruiter Workflow Integration & Security Review

## Scope

Reviewed the recruiter workflow against the existing student-side data model and the requested Company → Internship → Application → Interview → Evaluation flow.

## Critical bugs found and fixed

| Severity | Bug | Fix |
|---|---|---|
| Critical | Student portal had no endpoint to retrieve its applications/statuses. | Added `GET /api/student/applications` returning application status, internship/company data and interview summaries. |
| Critical | Interview records had no status. | Added `InterviewStatus` and exposed it to the student portal. |
| Critical | Interview could be created more than once for the same application. | Added controller conflict protection and a database unique constraint on `Interview.applicationId`. |
| High | No rescheduling endpoint existed. | Added `PATCH /api/company/interviews/:interviewId/reschedule`. |
| High | Evaluation did not mark the interview completed. | Evaluation upsert now marks the interview `COMPLETED` in the same transaction. |
| High | Evaluation result and application result were updated in separate operations. | Evaluation and application-result changes now run in a Prisma transaction. |
| High | Student interview response did not expose interview status. | Added `status` to `GET /api/student/interviews`. |
| Medium | Application endpoint did not reject applications after an internship deadline. | Added deadline check before creating an application. |
| High | Postman collection was invalid JSON because request bodies were not escaped correctly. | Rebuilt the collection as valid Postman v2.1 JSON with positive and negative tests. |

## Authorization review

Company-owned application, candidate, interview and evaluation queries are scoped through the authenticated user's `Company.id` and the internship relationship. A different company therefore receives `404` instead of another company's private resource.

Student endpoints are role-protected and filtered by `studentId = authenticated user id`.

Invalid/expired JWTs return `401`; authenticated users with the wrong role return `403`.

## Workflow test coverage prepared

The real-database integration script covers:

1. Company registration.
2. Student registration.
3. Company creates internship.
4. Student applies.
5. Duplicate application → `409`.
6. Company receives applications.
7. Company views candidate profile.
8. Other company candidate access → `404`.
9. Invalid application ID → `404`.
10. Student portal sees `APPLIED`.
11. Company shortlists candidate.
12. Student portal sees `SHORTLISTED`.
13. Company schedules interview.
14. Duplicate interview scheduling → `409`.
15. Student receives date/time, meeting link, type, round and status.
16. Company reschedules interview.
17. Student receives rescheduled details and `RESCHEDULED` status.
18. Company records `HOLD` evaluation.
19. Company updates evaluation to `SELECTED`.
20. Evaluation retrieval is company-scoped.
21. Student portal sees final `SELECTED` application result.
22. Interview becomes `COMPLETED` after evaluation.
23. Other company cannot access evaluation.
24. Student cannot access company applications.
25. Company rejects another candidate.
26. Rejected candidate cannot be scheduled for interview.
27. Missing interview details → validation `400`.
28. Invalid JWT → `401`.

## Actual database execution status

The source package now contains `scripts/integration-test.js` for execution against the project's real PostgreSQL `vic_db`. This environment cannot reach the user's local Windows PostgreSQL instance, so the real-database test itself must be run on the development machine after starting PostgreSQL and the API.

Run:

```powershell
npm install
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate dev
npm run dev
```

In another terminal:

```powershell
node scripts/integration-test.js
```

Expected final line:

```text
ALL INTEGRATION TESTS PASSED
```
