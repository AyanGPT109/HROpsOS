# HROpsOS: Workforce Operations Platform

## Overview
HROpsOS is a modern, scalable, and highly available SaaS (Software as a Service) platform designed to streamline workforce operations, attendance tracking, and employee management. It operates seamlessly alongside traditional HRMS and ERP systems, bridging the gap between field operations and management.

## The Problem
Managing a distributed, field-based, or plant-based workforce presents unique challenges. Legacy systems lack real-time visibility, are susceptible to buddy punching, and fail to track exact locations of employees checking in. Organizations suffer from manual tracking processes, lack of clear audit trails, and limited mobile-first capabilities for their front-line workers.

## The Solution: HROpsOS
HROpsOS introduces strict, automated, geofenced tracking. By leveraging real-time GPS positioning, multi-tenant architecture, and a mobile-first design, it ensures absolute accuracy in workforce attendance and scheduling.

### Key Features
- **Precision Geofencing:** Employees can only check in if they are physically within the designated radius of their assigned plant/site, validated by real-time device GPS coordinates.
- **Multi-Tenant Architecture:** A single deployment securely isolates data across multiple companies/tenants, making it an ideal B2B SaaS product.
- **Comprehensive Lifecycle Management:** From checking in and out, to tracking shift times, leave requests, and attendance history, every action is meticulously logged.
- **Triple-Portal System:** Dedicated interfaces for Frontline Workers, Company Administrators, and Platform Super Admins ensure each stakeholder sees only what they need, optimized for their specific tasks.
- **Strict Auditing:** A built-in `attendance_logs` and audit trailing system records coordinates, distance from the fence, and exact timestamps, preventing fraud.

## Value Proposition for Investors
1. **High B2B Demand:** Every organization with physical plants, construction sites, or distributed retail locations needs robust attendance tracking.
2. **Scalable Architecture:** Built on Supabase (PostgreSQL) and React, the system scales effortlessly from small businesses to massive enterprise roll-outs.
3. **Turnkey SaaS:** Features native multi-tenancy. As the platform owner, you can onboard new companies and bill them on a subscription basis seamlessly.
4. **Security & Compliance:** Row-Level Security (RLS) ensures tenant data is strongly siloed, mitigating data-leak risks and ensuring compliance with privacy standards.

## Technical Highlights
- **Frontend:** React, Vite, Tailwind CSS, providing a lightning-fast, responsive experience across Desktop and Mobile (PWA).
- **Backend/Database:** Supabase for real-time PostgreSQL database, Authentication, and Storage. Dedicated Node.js (Express) backend for secure, elevated operations.
- **Security First:** Enforces backend APIs using `SERVICE_ROLE_KEY` to securely bypass database RLS only when strictly validated, ensuring users cannot manipulate their location data.
