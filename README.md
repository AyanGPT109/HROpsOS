# HROpsOS

HROpsOS is the operating system for workforce operations. It complements an organization's HRMS, ERP, and payroll systems; it does not replace them.

Three independent applications — each with its own `frontend` and `backend`.

```
Attendance/
├── worker-app/
│   ├── frontend/     # Worker portal  → http://localhost:5173
│   └── backend/
├── admin-app/
│   ├── frontend/     # Admin portal   → http://localhost:5174
│   └── backend/
└── super-admin-app/
    ├── frontend/     # Super Admin    → http://localhost:5175
    └── backend/      # Secure API     → http://localhost:4000
```

## Run an app

### Worker
```bash
cd worker-app/frontend
npm install
cp .env.example .env
npm run dev
```

### Admin
```bash
cd admin-app/frontend
npm install
cp .env.example .env
npm run dev
```

### Super Admin
```bash
# Terminal 1 — secure backend (required for Create Admin / reset / soft-delete)
cd super-admin-app/backend
cp .env.example .env
# Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev

# Terminal 2 — frontend
cd super-admin-app/frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev
```

## Roles

| App | Allowed role | Port |
|-----|--------------|------|
| `worker-app` | `worker` | 5173 |
| `admin-app` | `admin` | 5174 |
| `super-admin-app` | `super_admin` | 5175 |

## Supabase tables

→ [`SUPABASE_TABLES.md`](SUPABASE_TABLES.md)

Create `admin_plants` before using Company Admin management.

## Product foundation

The workspace map, product-domain boundaries, delivery sequence, and target data model are recorded in [`HROPSOS_FOUNDATION.md`](HROPSOS_FOUNDATION.md).
