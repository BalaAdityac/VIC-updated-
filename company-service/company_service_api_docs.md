Company & Internship Service API Documentation

1. Executive Overview

The Company Service handles company account registration, secure JWT authentication, company profile management, and full Internship listing CRUD operations.

Key Features Implemented Today

Secure Password Hashing: Utilizes bcryptjs with salt rounds = 12.

JWT Auth Middleware: Protects restricted routes and extracts authenticated companyId.

Request Validation: Every payload is validated against strict Zod schemas before touching the database.

Internship CRUD & Status Management: Support for DRAFT, ACTIVE, CLOSED, and ARCHIVED states.

Strict Ownership Validation: Restricts editing and deletion of internship listings solely to the owner company.

Status Filtering: Query parameter support (?status=ACTIVE) for filtering company listings.

2. API Endpoints Reference

Authentication & Profile

POST /api/company/register

Registers a new company account.

Public

Request Body:

{
  "companyName": "Acme Tech Labs",
  "email": "hr@acmetech.com",
  "password": "Secret123!",
  "website": "[https://acmetech.com](https://acmetech.com)",
  "description": "Pioneering AI & Cloud Software Development",
  "address": "Tech Park, Building 4, Bengaluru, India",
  "gstNumber": "29ABCDE1234F1ZH"
}


Success Response (201 Created):

{
  "message": "Company registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "company": {
    "id": "b71a2f30-4e89-4a21-99cb-1e3d09a5b102",
    "companyName": "Acme Tech Labs",
    "email": "hr@acmetech.com",
    "status": "PENDING"
  }
}


POST /api/company/login

Authenticates company credentials and issues a JWT token.

Public

Request Body:

{
  "email": "hr@acmetech.com",
  "password": "Secret123!"
}


GET /api/company/profile

Fetches the logged-in company profile.

Headers: Authorization: Bearer <token>

PATCH /api/company/profile

Updates company details.

Headers: Authorization: Bearer <token>

Request Body (Partial):

{
  "website": "[https://careers.acmetech.com](https://careers.acmetech.com)",
  "description": "Updated global recruitment company bio."
}


DELETE /api/company/profile

Soft-deletes the company account and automatically archives associated internships.

Headers: Authorization: Bearer <token>

Internship Management

POST /api/internships

Creates a new internship listing.

Headers: Authorization: Bearer <token>

Request Body:

{
  "title": "Backend Software Engineer Intern",
  "description": "Work with Node.js, Fastify, PostgreSQL, and Prisma to build scalable microservices.",
  "location": "Bengaluru",
  "mode": "HYBRID",
  "stipend": 35000,
  "durationMonths": 6,
  "skills": ["Node.js", "TypeScript", "PostgreSQL", "Prisma"],
  "status": "DRAFT"
}


GET /api/internships/my-internships

Fetches all internships created by the authenticated company. Supports optional status filtering.

Headers: Authorization: Bearer <token>

Query Parameters: ?status=DRAFT | ACTIVE | CLOSED | ARCHIVED

Response:

{
  "count": 1,
  "filter": "DRAFT",
  "internships": [ ... ]
}


GET /api/internships/:id

Retrieves public details of a specific internship listing.

Public

PATCH /api/internships/:id

Updates internship listing details. Implements Ownership Guard.

Headers: Authorization: Bearer <token>

PATCH /api/internships/:id/status

Changes status of an internship posting (DRAFT -> ACTIVE -> CLOSED -> ARCHIVED).

Headers: Authorization: Bearer <token>

Request Body:

{
  "status": "ACTIVE"
}


DELETE /api/internships/:id

Soft-deletes an internship posting. Implements Ownership Guard.

Headers: Authorization: Bearer <token>

3. How to Run & Test

Setup Database & Dependencies:

npm install fastify @prisma/client bcryptjs jsonwebtoken zod
npm install -D typescript @types/node @types/bcryptjs @types/jsonwebtoken prisma tsx


Apply Migrations:

npx prisma db push


Start the Server:

npx tsx src/server.ts


Postman Testing:

Import postman_collection.json into Postman.

Run Register Company or Company Login; the Bearer token will be auto-saved to collection variables.

Execute Internship CRUD requests!