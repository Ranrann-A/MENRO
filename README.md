# MENRO Solid Waste Management System - User Manual

Welcome to the documentation for the Bayanihan Volunteers: Solid Waste Management System. This guide outlines the core modules of the application, how they function, and the primary codebase files associated with them.

---

## 1. Authentication Module
**Purpose:** To provide secure access to the system, ensuring that only registered residents can submit complaints and only authorized MENRO staff can access the management dashboard.

**Key Features:**
*   **User Registration:** Allows new residents to create an account, linking them to their specific Barangay.
*   **Secure Login:** Authenticates users and assigns them the correct access level (Resident vs. Admin) using role-based access.
*   **Session Management:** Keeps users securely logged in using Laravel Sanctum API tokens.

**Relevant Files:**
*   *Frontend:* `src/Login.jsx`, `src/Register.jsx`
*   *Backend:* `app/Http/Controllers/AuthController.php`, `app/Models/User.php`

---

## 2. Public Complaint Submission Module
**Purpose:** To empower residents to easily report solid waste issues (like uncollected garbage or illegal dumping) directly to the local government.

**Key Features:**
*   **Issue Reporting:** Users can fill out a form detailing the waste management issue.
*   **Photo Evidence:** The system supports uploading photo paths so residents can provide visual proof of the issue.
*   **Location Tagging:** Complaints are tied to specific Barangays for accurate geographical tracking and future GIS mapping.

**Relevant Files:**
*   *Frontend:* `src/ComplaintForm.jsx`
*   *Backend:* `app/Http/Controllers/ComplaintController.php`, `app/Models/Complaint.php`, `app/Models/Barangay.php`

---

## 3. Admin Dashboard Module
**Purpose:** A centralized control panel for MENRO administrators to monitor, process, and analyze all incoming waste management data.

**Key Features:**
*   **Complaint Tracking:** Admins can view a full list of all submitted complaints across the municipality.
*   **Status Updates:** Staff can change the status of a complaint (e.g., Pending, In Progress, Resolved) and add official response notes.
*   **Forwarding Flags:** Admins can flag certain complaints if they need to be forwarded to other specific municipal departments.

**Relevant Files:**
*   *Frontend:* `src/AdminDashboard.jsx`
*   *Backend:* `app/Http/Controllers/AdminComplaintController.php`
