# VIC Backend - Intern 2

## Run
1. Copy `.env.example` to `.env`.
2. Put the real PostgreSQL password in `DATABASE_URL`.
3. Ensure database `vic_db` exists.
4. `npm install`
5. `npx prisma generate`
6. `npx prisma migrate dev --name student_profile_module`
7. `npm run dev`

Server: http://localhost:5000
Health: GET /api/health

## APIs
Auth: POST /api/auth/register, POST /api/auth/login
Student: POST/GET/PUT/DELETE /api/students/profile
Complete profile: GET /api/students/profile/complete
Completion: GET /api/students/profile/completion
Education: POST/GET/PUT/DELETE /api/education
Projects: POST/GET/PUT/DELETE /api/projects
Skills: GET/POST/DELETE /api/skills
User skills: GET/POST/DELETE /api/skills/mine

Use `Authorization: Bearer <token>` after login.
