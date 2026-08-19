# VIC Super Admin Backend

This module uses the **existing JWT authentication and role middleware**. It does not introduce a second authentication mechanism or a separate admin password flow.

## Security model

1. Create/prepare a Super Admin once with `node scripts/create-super-admin.js <email> <password>`.
2. Login through the existing endpoint: `POST /api/auth/login`.
3. Use the returned JWT as `Authorization: Bearer <token>`.
4. Every `/api/admin/*` endpoint runs `auth` and `requireRole("SUPER_ADMIN")`.
5. Student and Company JWTs receive `403 Forbidden` on admin routes.
6. Admin accounts cannot be blocked/deleted through the normal user-management endpoints, and an admin cannot modify their own account.

## Database changes

- `Company.verificationStatus`: `PENDING | VERIFIED | REJECTED`.
- `AuditLog`: admin, action, entity type, entity id, metadata and timestamp.
- Migration: `20260818210000_add_admin_audit_verification`.

## Endpoints

### Identity / dashboard
- `GET /api/admin/me`
- `GET /api/admin/dashboard`

### Users
- `GET /api/admin/users?page=1&limit=20&search=&role=&status=`
- `GET /api/admin/users/:id`
- `GET /api/admin/users/:id/applications`
- `PATCH /api/admin/users/:id/block`
- `PATCH /api/admin/users/:id/unblock`
- `DELETE /api/admin/users/:id`

User details include profile, education, projects, skills, company information, application history, interviews/evaluations and selected internship/company information.

### Companies
- `GET /api/admin/companies?page=1&limit=20&search=&verificationStatus=&status=`
- `GET /api/admin/companies/:id`
- `PATCH /api/admin/companies/:id/verification`
- `PATCH /api/admin/companies/:id/block`
- `PATCH /api/admin/companies/:id/unblock`
- `DELETE /api/admin/companies/:id`

Verification body:
```json
{ "verificationStatus": "VERIFIED", "reason": "Documents reviewed" }
```

Blocking/unblocking changes the company's linked `User.status` to `SUSPENDED`/`ACTIVE`.

### Analytics
- `GET /api/admin/analytics/applications`
- `GET /api/admin/analytics/interviews`
- `GET /api/admin/analytics/trends/applications?days=30`
- `GET /api/admin/analytics/trends/interviews?days=30`

Dashboard statistics are calculated from live PostgreSQL data. Application status counts use the existing `ApplicationStatus` enum; interview statistics use the existing `InterviewStatus`, `InterviewRound` and `InterviewType` enums.

Trend endpoints return one row per day, including zero-activity days, so they can be consumed directly by graph components.

### Audit logs
- `GET /api/admin/audit-logs?page=1&limit=20&action=&entityType=&adminId=`

Logged administrative actions include user/company block, unblock, deletion and company verification changes. The `metadata` JSON field is intended for future admin actions.

## Validation / error behavior

- UUID route parameters are validated before controller execution.
- Pagination is bounded to 1–100 records per page.
- Analytics trend range is bounded to 1–365 days.
- Verification status is enum validated.
- Invalid IDs return `400 Validation failed` rather than reaching Prisma.
- Missing records return `404`.
- Non-admin authenticated users return `403`.
- Missing/invalid JWT returns `401`.

## Run

```powershell
cd backend
npm install
copy .env.example .env
# edit .env with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev
node scripts/create-super-admin.js admin@vic.local StrongPassword123!
npm run dev
```

Server: `http://localhost:5000`

## Postman

Import `postman/VIC-Super-Admin.postman_collection.json`. Set the collection variable `baseUrl` to `http://localhost:5000`. Run the `Login - Super Admin` request first; its test script stores the JWT in `superAdminToken`. The collection also contains negative authorization tests using Student/Company tokens when those variables are available.
