# HROpsOS Cloud Platform — Backend API

Secure API for privileged Super Admin operations (Auth user creation, password reset, soft delete).

## Setup

```bash
cd super-admin-app/backend
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Runs on `http://localhost:4000` by default.

## Endpoints

All routes require `Authorization: Bearer <supabase_access_token>` from a **super_admin** user.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/super-admin/create-admin` | Create Auth user + profile + admin + plants |
| PATCH | `/api/super-admin/admins/:id` | Update admin |
| POST | `/api/super-admin/admins/:id/enable` | Enable |
| POST | `/api/super-admin/admins/:id/disable` | Disable |
| POST | `/api/super-admin/admins/:id/reset-password` | Temp password + force change |
| DELETE | `/api/super-admin/admins/:id` | Soft delete |

Service Role Key stays on this server only — never in the React app.

## Plant endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/super-admin/plants` | Create plant + audit |
| PATCH | `/api/super-admin/plants/:id` | Update plant |
| POST | `/api/super-admin/plants/:id/soft-delete` | `is_active = false` |
| POST | `/api/super-admin/plants/:id/restore` | `is_active = true` |
| POST | `/api/super-admin/geofences` | Create / upsert geo fence |
