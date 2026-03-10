# Roadmap

## Phase 1: Foundation & Core Identity (The Bedrock)
- **Project Scaffold:** Initialize mono-repo or separate frontend/backend directories.
- **Database Schema:** Set up PostgreSQL with initial migrations for core tables (`users`, `staff`, `patients`).
- **Auth & RBAC:** Implement user authentication (Email/Password) and role-based access control.
- **UI/UX Framework:** Set up React/Next.js with a "Modern Minimalist" design system and mobile-first approach.

## Phase 2: OPD & Patient Onboarding (The Outpatient Flow)
- **Patient Registration:** Build the registration and search interface for patients.
- **Appointments:** Implement doctor scheduling, appointment booking, and token system.
- **OPD Dashboards:** Basic overview for Receptionists and Doctors.

## Phase 3: Clinical Documentation (The EMR Core)
- **Consultations:** Interface for doctors to record vitals, symptoms, and diagnosis.
- **Prescriptions:** Digital prescription generation and history tracking.
- **EMR Integration:** Unified patient record view across OPD/IPD visits.

## Phase 4: IPD & Hospital Operations (The Inpatient Flow)
- **Ward/Bed Management:** Real-time tracking of beds and occupancy.
- **Admissions:** Managing admissions, transfer, and discharge processes.
- **Nursing Logs:** IPD-specific monitoring and documentation.

## Phase 5: Laboratory & Pharmacy (The Diagnostic & Medicine Loop)
- **Lab Workflow:** Requests, sample tracking, and JSONB-based result reporting.
- **Pharmacy Workflow:** Medicine master list, inventory tracking, and dispensing.

## Phase 6: Billing & Financial Reporting (The Revenue Cycle)
- **Automatic Invoicing:** Linking clinical activities to billing items.
- **Payments:** Managing transactions, payments, and receipt generation.
- **Admin Analytics:** Financial dashboards and operational reports.

## Phase 7: Polish & Advanced Features (The Final Touch)
- **OAuth Integration:** Adding Google Login.
- **Notifications:** Email/SMS reminders for appointments and results.
- **Optimizations:** Advanced caching, database indexing, and performance tuning.
- **Deployment:** Full production deployment to Vercel/Render/Azure.
