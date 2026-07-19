# Supabase tables to create (Table Editor)

Create these tables in **Supabase → Table Editor**.  
Enable **UUID** primary keys and timestamps where noted.

Also create a Storage bucket named **`avatars`** (public read recommended for profile images).

---

## 1. `companies`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | required |
| code | text | required, unique |
| logo_url | text | nullable |
| email | text | nullable |
| phone | text | nullable |
| address | text | nullable |
| is_active | bool | default `true` |
| subscription_plan | text | default `standard` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 2. `profiles`

Linked to **Authentication → Users** (`auth.users.id`).

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK, **same as** `auth.users.id` |
| email | text | required |
| full_name | text | required |
| role | text | `worker` \| `admin` \| `super_admin` |
| phone | text | nullable |
| avatar_url | text | nullable |
| company_id | uuid | FK → `companies.id`, nullable |
| force_password_change | bool | default `false` |
| is_active | bool | default `true` |
| device_id | text | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 3. `plants`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| company_id | uuid | FK → `companies.id` |
| name | text | required |
| code | text | required |
| address | text | nullable |
| latitude | float8 | nullable |
| longitude | float8 | nullable |
| timezone | text | default `Asia/Kolkata` |
| is_active | bool | default `true` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 4. `geo_fence`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| plant_id | uuid | FK → `plants.id`, unique (one fence per plant) |
| name | text | nullable |
| latitude | float8 | required |
| longitude | float8 | required |
| radius_meters | float8 | required, e.g. `200` |
| is_active | bool | default `true` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 5. `admins`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → `profiles.id`, unique |
| company_id | uuid | FK → `companies.id` |
| plant_ids | uuid[] | default `{}` (legacy / cache; prefer `admin_plants`) |
| is_active | bool | default `true` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 5b. `admin_plants` (required for Super Admin module)

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK, default `gen_random_uuid()` |
| admin_id | uuid | FK → `admins.id` ON DELETE CASCADE |
| plant_id | uuid | FK → `plants.id` ON DELETE CASCADE |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

Unique: `(admin_id, plant_id)`

`created_by` is optional audit metadata. The application only requires
`admin_id` and `plant_id` when creating assignment rows, so existing deployments
whose `admin_plants` table predates the audit column remain compatible.

---

## 6. `workers`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → `profiles.id`, unique |
| company_id | uuid | FK → `companies.id` |
| plant_id | uuid | FK → `plants.id`, nullable |
| employee_id | text | required |
| department | text | nullable |
| designation | text | nullable |
| shift_id | uuid | nullable |
| joined_at | date | nullable |
| is_active | bool | default `true` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

Unique: `(company_id, employee_id)`

---

## 7. `worker_schedule`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| worker_id | uuid | FK → `workers.id` |
| plant_id | uuid | FK → `plants.id` |
| day_of_week | int2 | `1`=Mon … `7`=Sun |
| shift_start | time | required |
| shift_end | time | required |
| break_minutes | int4 | default `30` |
| is_working_day | bool | default `true` |
| effective_from | date | nullable |
| effective_to | date | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 8. `attendance`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| worker_id | uuid | FK → `workers.id` |
| company_id | uuid | FK → `companies.id` |
| plant_id | uuid | FK → `plants.id` |
| date | date | required |
| status | text | `present` \| `absent` \| `half_day` \| `late` \| `on_leave` \| `checked_in` \| `checked_out` \| `not_checked_in` |
| check_in_at | timestamptz | nullable |
| check_out_at | timestamptz | nullable |
| check_in_lat | float8 | nullable |
| check_in_lon | float8 | nullable |
| check_out_lat | float8 | nullable |
| check_out_lon | float8 | nullable |
| check_in_accuracy | float8 | nullable |
| check_out_accuracy | float8 | nullable |
| worked_minutes | int4 | default `0` |
| is_late | bool | default `false` |
| notes | text | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

Unique: `(worker_id, date)`

---

## 9. `attendance_logs`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| worker_id | uuid | FK → `workers.id` |
| company_id | uuid | FK → `companies.id` |
| plant_id | uuid | FK → `plants.id` |
| attendance_id | uuid | FK → `attendance.id`, nullable |
| event_type | text | `check_in` \| `check_out` \| `geo_exit` \| `geo_return` \| `geo_enter` \| `heartbeat` |
| latitude | float8 | required |
| longitude | float8 | required |
| accuracy | float8 | nullable |
| distance_from_fence | float8 | nullable |
| inside_fence | bool | nullable |
| device_info | jsonb | nullable |
| metadata | jsonb | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 10. `leave_requests`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| worker_id | uuid | FK → `workers.id` |
| company_id | uuid | FK → `companies.id` |
| leave_type | text | `casual` \| `sick` \| `earned` \| `unpaid` \| `compensatory` \| `maternity` \| `paternity` \| `other` |
| status | text | `pending` \| `approved` \| `rejected` \| `cancelled` |
| start_date | date | required |
| end_date | date | required |
| days_count | numeric | default `1` |
| reason | text | required |
| reviewed_by | uuid | FK → `profiles.id`, nullable |
| reviewed_at | timestamptz | nullable |
| review_note | text | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 11. `notifications`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → `profiles.id` |
| title | text | required |
| body | text | required |
| type | text | nullable |
| data | jsonb | default `{}` |
| is_read | bool | default `false` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 12. `audit_logs`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| action | text | required |
| entity_type | text | required |
| entity_id | uuid | nullable |
| actor_id | uuid | FK → `profiles.id`, nullable |
| company_id | uuid | FK → `companies.id`, nullable |
| ip_address | text | nullable |
| user_agent | text | nullable |
| old_values | jsonb | nullable |
| new_values | jsonb | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## 13. `support_tickets`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| company_id | uuid | FK → `companies.id` |
| subject | text | required |
| description | text | required |
| status | text | `open` \| `in_progress` \| `resolved` \| `closed` |
| priority | text | `low` \| `medium` \| `high` \| `critical` |
| created_by_user_id | uuid | FK → `profiles.id`, nullable |
| assigned_to | uuid | FK → `profiles.id`, nullable |
| resolved_at | timestamptz | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |
| created_by | uuid | nullable |

---

## Create order (recommended)

1. `companies`  
2. `profiles`  
3. `plants`  
4. `geo_fence`  
5. `admins`  
6. `admin_plants`  
7. `workers`  
8. `worker_schedule`  
9. `attendance`  
10. `attendance_logs`  
11. `leave_requests`  
12. `notifications`  
13. `audit_logs`  
14. `support_tickets`  

Then: Storage → New bucket → **`avatars`**

---

## Recommended (optional enterprise tables)

### `admin_activity_logs`

| Column | Type |
|--------|------|
| id | uuid PK |
| admin_id | uuid FK → admins |
| action | text |
| module | text |
| description | text |
| ip_address | text |
| device | text |
| created_at | timestamptz |

### `company_settings`

| Column | Type |
|--------|------|
| id | uuid PK |
| company_id | uuid FK → companies, unique |
| timezone | text |
| working_hours | jsonb |
| late_threshold_minutes | int |
| geofence_default_radius | float8 |
| branding | jsonb |
| created_at / updated_at | timestamptz |

### `password_reset_tokens`

Only if you add a custom reset flow (Supabase Auth already covers most cases).
