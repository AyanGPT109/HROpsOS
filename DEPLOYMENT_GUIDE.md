# HROpsOS: Deployment & Architecture Guide

This document is intended for System Administrators, DevOps Engineers, and Platform Managers responsible for deploying and maintaining the HROpsOS environment.

## 1. Folder Structure Overview

The repository is structured as a monorepo consisting of three primary applications, each decoupled to ensure security and scalability:

```text
/d:/Attendance/
├── admin-app/
│   ├── frontend/         # React SPA for Company Administrators
│   └── backend/          # (Reserved/Placeholder for future microservices)
├── super-admin-app/
│   ├── frontend/         # React SPA for Platform Owners
│   └── backend/          # Express.js Node Server (Core privileged operations)
└── worker-app/
    └── frontend/         # React PWA for Field Workers
```

## 2. Environment Variables (.env)

The system relies heavily on environment configurations to securely connect to the Supabase backend and interconnect the microservices. 

There are **four (4) total `.env` files** required to run the full stack. You must create these files by duplicating the provided `.env.example` files in their respective directories.

### Required Locations:
1. `worker-app/frontend/.env`
   - Needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` (pointing to super-admin backend)
2. `admin-app/frontend/.env`
   - Needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. `super-admin-app/frontend/.env`
   - Needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
4. `super-admin-app/backend/.env`
   - Needs: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Crucial for bypassing Row-Level Security)

> **Security Warning:** Never expose the `SUPABASE_SERVICE_ROLE_KEY` in any of the frontend `.env` files. It should only ever exist within `super-admin-app/backend/.env`.

## 3. Database Architecture (Supabase)

The platform is powered by a central Supabase (PostgreSQL) instance.
- **Row-Level Security (RLS):** RLS must be enabled on all tables (e.g., `attendance`, `geo_fence`). The `worker-app` and `admin-app` connect using the restricted Anon key.
- **API Proxying:** Actions that require elevated privileges (like writing attendance logs while bypassing RLS) are proxied through the `super-admin-app/backend` which uses the privileged Service Role Key.

### Database Setup
1. Create a new Supabase project.
2. Execute the schema found in `SUPABASE_TABLES.md` within the Supabase SQL Editor.
3. Configure your Supabase Auth settings to allow Email/Password sign-ups.

## 4. Local Deployment Instructions

To spin the entire stack up locally:

1. **Install Dependencies:**
   Run `npm install` inside each of the four main directories (`worker-app/frontend`, `admin-app/frontend`, `super-admin-app/frontend`, `super-admin-app/backend`).
2. **Start the Backend:**
   Navigate to `super-admin-app/backend` and run `npm run dev` (typically runs on `http://localhost:4000`).
3. **Start the Frontends:**
   Navigate to each frontend directory and run `npm run dev`.
   - Worker App will run on `http://localhost:5173`
   - Admin App will run on `http://localhost:5174`
   - Super Admin App will run on `http://localhost:5175`

## 5. Production Deployment Recommendations
- **Frontends:** Deploy the three React applications to Vercel, Netlify, or AWS CloudFront/S3. Ensure the Worker App is configured as a PWA so employees can "Add to Home Screen".
- **Backend:** Deploy the Node.js Express server to a scalable platform like Render, Railway, AWS ECS, or Heroku.
- **Database:** Utilize a managed Supabase Pro instance for automated backups, higher connection pooling limits, and Point-in-Time Recovery.
