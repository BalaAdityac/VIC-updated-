# VIC Company Portal

Next.js company-side portal for Visionary Interns Club.

## Modules
- Company dashboard and hiring pipeline
- Company profile
- Job management
- Student applications
- Interview scheduling
- Evaluations
- Offer tracking
- Responsive mobile navigation

## Run
```powershell
npm install
npm run dev
```
Open http://localhost:3000

## Backend
Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
The UI currently uses demo data; connect buttons to the VIC company APIs when those endpoints are available.
