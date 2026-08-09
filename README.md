# Placement Portal — Authentication Module

Complete, runnable Authentication module built on **Node.js + Express + PostgreSQL + Prisma**, with JWT auth,
role-based authorization (Student / Company / SuperAdmin), Zod validation, global error handling, request
logging, Swagger docs, and a Postman collection.

## Folder Structure

```
prisma/
  schema.prisma            Users, StudentProfiles, Education, Projects, Skills, UserSkills

src/
  config/
    env.js                 Centralized environment variable loader
    prisma.js              Singleton Prisma client
    swagger.js              Swagger/OpenAPI spec builder
  middlewares/
    auth.middleware.js     JWT verification (protects private routes)
    role.middleware.js     Role-based authorization (RBAC)
    error.middleware.js    Global error handler (Zod/Prisma/JWT/AppError)
    logger.middleware.js   Request logging (morgan)
    validate.middleware.js Generic Zod request validator
  modules/
    auth/
      auth.controller.js   HTTP handlers
      auth.service.js      Business logic
      auth.repository.js   All Prisma/database access
      auth.routes.js       Routes + Swagger JSDoc annotations
      auth.validation.js   Zod schemas
      auth.dto.js          Strips sensitive fields (password) from responses
  routes/
    index.js               Mounts every module's routes under /api
  utils/
    AppError.js            Operational error class
    catchAsync.js           Removes try/catch boilerplate from controllers
    hash.util.js            bcrypt helpers
    jwt.util.js              JWT sign/verify helpers
    response.util.js        Consistent success/error response shape
  app.js                    Express app (middleware, routes, docs, error handler)
  server.js                 Entry point — connects to DB, starts the server

postman/
  Placement-Portal-Auth.postman_collection.json
```

This same controller → service → repository → route → validation → DTO pattern is meant to be copied for
every future module (Student Profile, Jobs, Applications, Companies, Certificates).

## Prerequisites

- Node.js 18+
- npm
- A running PostgreSQL instance (local, Docker, or hosted)

## Setup — run these commands in order

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in your own values
cp .env.example .env
# then edit .env:
#   - DATABASE_URL  -> your PostgreSQL connection string
#   - JWT_SECRET    -> any long random string

# 3. Generate the Prisma client from schema.prisma
npx prisma generate

# 4. Create the database tables (runs the migration against DATABASE_URL)
npx prisma migrate dev --name init

# 5. Start the server
npm run dev        # with auto-reload (nodemon)
# or
npm start           # plain node
```

The server starts on `http://localhost:5000` by default (`PORT` in `.env`).

- Health check: `GET http://localhost:5000/health`
- Swagger UI: `http://localhost:5000/api-docs`
- API base path: `http://localhost:5000/api`

### Don't have PostgreSQL running locally? Quickest option with Docker:

```bash
docker run --name placement-portal-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=placement_portal -p 5432:5432 -d postgres:16
```

Then set in `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/placement_portal?schema=public"
```

## Endpoints

| Method | Endpoint                     | Auth required | Description                                  |
|--------|-------------------------------|:--------------:|-----------------------------------------------|
| POST   | `/api/auth/register`          | No             | Register a new user (Student by default)      |
| POST   | `/api/auth/login`             | No             | Log in, receive a JWT access token             |
| GET    | `/api/auth/me`                | Yes            | Get the current authenticated user's profile   |
| PATCH  | `/api/auth/update-password`   | Yes            | Update the logged-in user's password           |
| POST   | `/api/auth/forgot-password`   | No             | Start forgot-password flow (structure only)    |
| POST   | `/api/auth/logout`            | Yes            | Log out                                        |

Every response follows the same envelope:

```json
{ "success": true, "message": "...", "data": { } }
```
```json
{ "success": false, "message": "...", "errors": null }
```

### Sample requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Passw0rd!23","role":"Student"}'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Passw0rd!23"}'
```

**Get current user** (replace `<TOKEN>` with the token from register/login)
```bash
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <TOKEN>"
```

**Update password**
```bash
curl -X PATCH http://localhost:5000/api/auth/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"currentPassword":"Passw0rd!23","newPassword":"NewPassw0rd!45"}'
```

**Forgot password**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}'
```

**Logout**
```bash
curl -X POST http://localhost:5000/api/auth/logout -H "Authorization: Bearer <TOKEN>"
```

## Postman

Import `postman/Placement-Portal-Auth.postman_collection.json` into Postman. It includes:

- Every endpoint with a ready-to-send example body
- A `baseUrl` collection variable (defaults to `http://localhost:5000/api`)
- A test script on Register/Login that automatically saves the returned JWT into the `token`
  collection variable, so the protected requests (Get Current User, Update Password, Logout)
  work immediately with no manual copy-pasting
- Example success and error response bodies attached to each request

## Role-Based Authorization (for future modules)

`src/middlewares/role.middleware.js` exports an `authorize(...roles)` factory. Use it after `authenticate`
on any route in a future module:

```js
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/admin-only", authenticate, authorize("SuperAdmin"), handler);
router.get("/staff-area", authenticate, authorize("Company", "SuperAdmin"), handler);
```

## Notes

- Passwords are hashed with **bcrypt** (`BCRYPT_SALT_ROUNDS` in `.env`, default 10) — plaintext passwords
  are never stored or logged.
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (default `1d`).
- Login and password-update failures return generic messages so the API never reveals whether an email
  is registered or which field was wrong.
- **Forgot Password** is intentionally structure-only per this module's scope: the route, validation,
  service method, and a generic response are implemented; wiring an email/OTP provider is left as a
  documented `TODO` in `auth.service.js`.
- **Logout** is documented as stateless (the client discards the token). The extension point for a
  token-blacklist or refresh-token store (e.g. Redis) is marked with a `TODO` in `auth.service.js`.
