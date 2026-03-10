# Requirements

## Functional Requirements

### 1. User Management & Authentication (RBAC)
- **Roles:** Admin, Doctor, Nurse, Receptionist, Patient, Lab Tech, Pharmacist.
- **Features:** Registration, login (Email/Password, Google OAuth), profile management, and role-based permissions.

### 2. Patient Management (OPD & IPD)
- **OPD:** Patient registration, appointment scheduling, token management, vitals tracking, and consultation notes.
- **IPD:** Admission management, bed/ward allocation, discharge summaries, and inpatient vitals log.
- **EMR:** Centralized Electronic Medical Records for each patient, including visit history and diagnostic results.

### 3. Clinical Workflows
- **Prescriptions:** Digital prescriptions with medication name, dosage, and frequency.
- **Lab Management:** Lab test requests, sample collection tracking, and digital result reporting (JSONB-based).
- **Pharmacy:** Inventory management (stock, batch, expiry) and medicine dispensing.

### 4. Billing & Finance
- **Service Pricing:** Standardized rates for consultations, lab tests, room rent, and procedures.
- **Invoicing:** Automatic generation of invoices from OPD/IPD/Pharmacy/Lab activities.
- **Payments:** Payment tracking (Cash, Card, Online) and receipt generation.

### 5. Administrative Features
- **Staff Management:** Onboarding and role assignment for hospital personnel.
- **Inventory & Bed Management:** Real-time tracking of beds and hospital supplies.
- **Dashboards:** Analytical overview of appointments, occupancy, and revenue.

## Non-Functional Requirements

### 1. Performance
- **Optimized Queries:** Efficient PostgreSQL indexing for fast data retrieval.
- **Fast APIs:** Node.js/Express with asynchronous processing.

### 2. Security
- **Data Protection:** Encrypted passwords and sensitive data (bcrypt, SSL/TLS).
- **Audit Logging:** Triggers to track changes to critical records (billing, EMR).

### 3. UX/UI
- **Minimalist Design:** Clean, distraction-free interface.
- **Mobile-first:** Responsive design for tablets and mobile devices.
- **Accessibility:** Compliance with WCAG standards for healthcare accessibility.

## Data Model (PostgreSQL)

### Core Tables
- **`users` / `staff` / `patients`**: Primary entities.
- **`appointments` / `consultations`**: OPD flow.
- **`admissions` / `wards` / `beds`**: IPD flow.
- **`prescriptions` / `medicines` / `inventory`**: Pharmacy flow.
- **`lab_requests` / `lab_results`**: Laboratory flow.
- **`invoices` / `invoice_items` / `payments`**: Billing flow.
