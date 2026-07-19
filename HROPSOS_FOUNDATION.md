# HROpsOS Foundation

HROpsOS is an enterprise Workforce Operations Platform. It is the operational system of record for workforce activity and integrates with HRMS, ERP, and payroll systems through imports, exports, and APIs. Payroll, accounting, recruitment, performance management, and AI decision-making are out of scope.

## Workspace map

| HROpsOS workspace | Current application | v1 responsibility |
|---|---|---|
| Employee Experience | `worker-app/frontend` | Self-service attendance, shift, leave, documents, assets, and profile |
| Tenant Workspace | `admin-app/frontend` | Company workforce, attendance, scheduling, site operations, reporting, and configuration |
| HROpsOS Cloud | `super-admin-app/frontend` + backend | Tenant lifecycle, platform users, support, audit, monitoring, and analytics |
| Contractor Workspace | Planned standalone app | Contractor users, workers, attendance, documents, contracts, work orders, invoices, and reports |

The Contractor Workspace is intentionally not folded into the tenant portal: it needs independent login, strict organization boundaries, and a limited contractor-specific permission model.

## Product domains

1. Platform Foundation — identity, role-based authorization, multi-tenancy, notifications, audit, storage, imports/exports, dashboards, and settings.
2. Organization Foundation — company, business unit, region, branch, site, department, designation, grade, employee category, and calendar.
3. Workforce Management — employee/worker master, employment lifecycle, deployment, documents, skills, certifications, and directory.
4. Workforce Operations — attendance, leave, holiday, shifts, rosters, scheduling, timesheets, overtime, approvals, exceptions, and planning.
5. Contractor Operations — contractor master, contracts, work orders, worker and site mapping, rates, invoices, and contractor analytics.
6. Operational Services — assets, gate pass, visitors, vehicles, travel, checklists, tasks, announcements, and operational logs.
7. Intelligence & Analytics — executive, operations, HR, contractor, site, attendance, leave, shift, workforce, and trend dashboards.
8. Integration Hub — REST APIs, webhooks, CSV/Excel I/O, HRMS/ERP/payroll and biometric connectors, email, SMS, and push notifications.
9. Administration — users, roles, permissions, menus, approval matrices, templates, master data, imports, and system settings.
10. Platform Services — support tickets, help center, product tour, knowledge base, release notes, API documentation, and system health.

## Foundation delivery sequence

### Now

- Brand all existing workspaces as HROpsOS and use the HROpsOS workspace names.
- Preserve the operational attendance, location/geofence, leave, schedule, worker, company, plant/site, notification, and audit foundations.
- Keep all privileged cloud actions behind the secure Cloud API.

### Next

- Add a dedicated Contractor Workspace and `contractor_admin` / `contractor_supervisor` roles.
- Expand organization masters beyond company and site: branch, region, department, designation, category, and calendar.
- Add import jobs with template download, validation, preview, duplicate detection, rollback, import history, and downloadable error reports.
- Introduce approval matrices and an auditable workflow engine for attendance, leave, shift, and operational requests.

### Later

- Implement workforce planning, allocation, asset operations, work orders, invoices, integration connectors, and drill-down analytics.
- Build historical operational forecasting only (for example absenteeism and staffing trends); do not introduce AI decision-making.

## Data and security rules

- Every tenant-owned record must carry `company_id`; contractor-owned records also carry `contractor_id` and must be scoped to an authorized company.
- Every mutation records actor, timestamp, tenant, entity, action, and old/new values in the audit log.
- Row-level access must enforce the active role plus company, site, department, and contractor assignments. Never rely solely on client-side menu hiding.
- Attendance data flows through validation, attendance, leave, shift, workforce, analytics, reporting, and integration layers in that order.
- The existing `plants` model represents the initial Site master. New naming in screens and APIs should prefer `site`; database renames require a versioned migration and backwards-compatible API aliases.

## Definition of done for each domain

Each shipped module must support role-based access, tenant scoping, audit events, responsive employee and desktop experiences, empty/error states, export where relevant, and drill-down from company to region, branch, site, contractor, department, shift, and worker when the data hierarchy applies.
